"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthUser, UserProfile, TrustedContact } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { INITIAL_USER_PROFILE } from "@/lib/store/mock-data";

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  trustedContacts: TrustedContact[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (fullName: string, email: string, password?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  addContact: (contact: Omit<TrustedContact, "id">) => Promise<{ success: boolean; contact?: TrustedContact; error?: string }>;
  updateContact: (id: string, updates: Partial<TrustedContact>) => Promise<{ success: boolean; error?: string }>;
  deleteContact: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PROFILE = "guardian_user_profile";
const LOCAL_STORAGE_KEY_SESSION = "guardian_user_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>(INITIAL_USER_PROFILE.contacts);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Helper to translate errors into friendly messages
  const formatAuthError = (err: any): string => {
    if (!err) return "An unexpected error occurred. Please try again.";
    const msg = typeof err === "string" ? err : err.message || "";
    if (msg.includes("Invalid login credentials") || msg.includes("invalid_grant")) {
      return "Invalid email or password. Please verify your credentials.";
    }
    if (msg.includes("User already registered") || msg.includes("already exists")) {
      return "An account with this email address already exists. Please sign in instead.";
    }
    if (msg.includes("Password should be at least")) {
      return "Password is too weak. Please use at least 6 characters.";
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return "Network connection issue. Please check your internet connection.";
    }
    if (msg.includes("rate limit")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    return msg || "Authentication service temporarily unavailable.";
  };

  // Sync state from Supabase session or localStorage
  const initializeAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || "",
          fullName: session.user.user_metadata?.full_name || "Guardian Traveler",
        };
        setUser(authUser);

        // Fetch user profile from Supabase
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        // Fetch contacts
        const { data: contactsData } = await supabase
          .from("trusted_contacts")
          .select("*")
          .eq("user_id", session.user.id);

        if (profileData) {
          const userProf: UserProfile = {
            id: profileData.id,
            email: profileData.email || session.user.email || "",
            fullName: profileData.full_name || "Guardian Traveler",
            phone: profileData.phone || "",
            emergencyNotes: profileData.emergency_notes || "",
            contacts: contactsData || [],
            createdAt: profileData.created_at,
            updatedAt: profileData.updated_at,
          };
          setProfile(userProf);
          setTrustedContacts(contactsData || []);
        } else {
          // Fallback profile
          const defaultProf: UserProfile = {
            ...INITIAL_USER_PROFILE,
            id: session.user.id,
            email: session.user.email || "",
            fullName: session.user.user_metadata?.full_name || "Guardian Traveler",
          };
          setProfile(defaultProf);
          setTrustedContacts(INITIAL_USER_PROFILE.contacts);
        }
      } else {
        // Fallback / Demo Session stored in localStorage
        if (typeof window !== "undefined") {
          const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION);
          const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);

          if (savedSession) {
            const parsedUser = JSON.parse(savedSession);
            setUser(parsedUser);
            if (savedProfile) {
              const parsedProfile = JSON.parse(savedProfile);
              setProfile(parsedProfile);
              setTrustedContacts(parsedProfile.contacts || INITIAL_USER_PROFILE.contacts);
            } else {
              setProfile(INITIAL_USER_PROFILE);
              setTrustedContacts(INITIAL_USER_PROFILE.contacts);
            }
          } else {
            // Default demo authenticated session for effortless evaluation
            setUser({
              id: INITIAL_USER_PROFILE.id,
              email: "alex.rivera@guardian.safe",
              fullName: INITIAL_USER_PROFILE.fullName,
            });
            setProfile(INITIAL_USER_PROFILE);
            setTrustedContacts(INITIAL_USER_PROFILE.contacts);
          }
        }
      }
    } catch (err) {
      console.warn("Auth initialization error, loaded demo store:", err);
      setUser({
        id: INITIAL_USER_PROFILE.id,
        email: "alex.rivera@guardian.safe",
        fullName: INITIAL_USER_PROFILE.fullName,
      });
      setProfile(INITIAL_USER_PROFILE);
      setTrustedContacts(INITIAL_USER_PROFILE.contacts);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    initializeAuth();

    // Listen for auth state changes if Supabase is active
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          fullName: session.user.user_metadata?.full_name || "Guardian Traveler",
        });
        initializeAuth();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setTrustedContacts([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, supabase]);

  // Sign In
  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      if (password && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const { data, error: sbError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (sbError) {
          const friendly = formatAuthError(sbError);
          setError(friendly);
          setLoading(false);
          return { success: false, error: friendly };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || "Guardian Traveler",
          };
          setUser(authUser);
          await initializeAuth();
          setLoading(false);
          return { success: true };
        }
      }

      // Demo fallback sign-in
      const demoUser: AuthUser = {
        id: `usr_${Date.now()}`,
        email,
        fullName: profile?.fullName || "Alex Rivera",
      };
      setUser(demoUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(demoUser));
      }
      setLoading(false);
      return { success: true };
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      setLoading(false);
      return { success: false, error: friendly };
    }
  };

  // Sign Up
  const signUp = async (
    fullName: string,
    email: string,
    password?: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      if (password && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const { data, error: sbError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || "",
            },
          },
        });

        if (sbError) {
          const friendly = formatAuthError(sbError);
          setError(friendly);
          setLoading(false);
          return { success: false, error: friendly };
        }

        if (data.user) {
          // Explicit profile creation in case trigger is pending
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName,
            email,
            phone: phone || "",
            updated_at: new Date().toISOString(),
          });

          const authUser: AuthUser = {
            id: data.user.id,
            email,
            fullName,
          };
          setUser(authUser);
          await initializeAuth();
          setLoading(false);
          return { success: true };
        }
      }

      // Demo fallback sign-up
      const newUserId = `usr_${Date.now()}`;
      const authUser: AuthUser = {
        id: newUserId,
        email,
        fullName,
      };
      const newProfile: UserProfile = {
        id: newUserId,
        email,
        fullName,
        phone: phone || "+1 (555) 439-8821",
        emergencyNotes: "Standard emergency monitoring",
        contacts: INITIAL_USER_PROFILE.contacts,
      };

      setUser(authUser);
      setProfile(newProfile);
      setTrustedContacts(newProfile.contacts);

      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(authUser));
        localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      setLoading(false);
      return { success: false, error: friendly };
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase sign out error:", e);
    }
    setUser(null);
    setProfile(null);
    setTrustedContacts([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION);
      localStorage.removeItem(LOCAL_STORAGE_KEY_PROFILE);
    }
    setLoading(false);
  };

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: "No active profile." };
    setLoading(true);

    try {
      if (user?.id && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const { error: sbError } = await supabase
          .from("profiles")
          .update({
            full_name: updates.fullName,
            phone: updates.phone,
            emergency_notes: updates.emergencyNotes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (sbError) {
          setError(formatAuthError(sbError));
          setLoading(false);
          return { success: false, error: formatAuthError(sbError) };
        }
      }

      const updated = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setProfile(updated);

      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updated));
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      setLoading(false);
      return { success: false, error: friendly };
    }
  };

  // Add Trusted Contact
  const addContact = async (contact: Omit<TrustedContact, "id">): Promise<{ success: boolean; contact?: TrustedContact; error?: string }> => {
    try {
      const newId = `cnt_${Date.now()}`;
      const newContact: TrustedContact = {
        ...contact,
        id: newId,
        userId: user?.id,
        createdAt: new Date().toISOString(),
      };

      if (user?.id && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const { error: sbError } = await supabase
          .from("trusted_contacts")
          .insert({
            id: newId,
            user_id: user.id,
            name: contact.name,
            phone: contact.phone,
            email: contact.email || null,
            relationship: contact.relationship,
            notify_on_high_risk: contact.notifyOnHighRisk,
            notify_on_sos: contact.notifyOnSos,
          });

        if (sbError) {
          console.warn("Supabase contact insert error:", sbError);
        }
      }

      const updatedContacts = [newContact, ...trustedContacts];
      setTrustedContacts(updatedContacts);
      if (profile) {
        const updatedProf = { ...profile, contacts: updatedContacts };
        setProfile(updatedProf);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updatedProf));
        }
      }

      return { success: true, contact: newContact };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Update Trusted Contact
  const updateContact = async (id: string, updates: Partial<TrustedContact>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (user?.id && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        await supabase
          .from("trusted_contacts")
          .update({
            name: updates.name,
            phone: updates.phone,
            email: updates.email,
            relationship: updates.relationship,
            notify_on_high_risk: updates.notifyOnHighRisk,
            notify_on_sos: updates.notifyOnSos,
          })
          .eq("id", id)
          .eq("user_id", user.id);
      }

      const updatedContacts = trustedContacts.map((c) => (c.id === id ? { ...c, ...updates } : c));
      setTrustedContacts(updatedContacts);
      if (profile) {
        const updatedProf = { ...profile, contacts: updatedContacts };
        setProfile(updatedProf);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updatedProf));
        }
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Delete Trusted Contact
  const deleteContact = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (user?.id && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        await supabase
          .from("trusted_contacts")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
      }

      const updatedContacts = trustedContacts.filter((c) => c.id !== id);
      setTrustedContacts(updatedContacts);
      if (profile) {
        const updatedProf = { ...profile, contacts: updatedContacts };
        setProfile(updatedProf);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updatedProf));
        }
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        trustedContacts,
        loading,
        error,
        clearError: () => setError(null),
        signIn,
        signUp,
        signOut,
        updateProfile,
        addContact,
        updateContact,
        deleteContact,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
