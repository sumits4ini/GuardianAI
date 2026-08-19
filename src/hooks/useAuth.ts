"use client";

import { useGuardian } from "@/lib/store/demo-context";

export function useAuth() {
  const { userProfile, updateUserProfile } = useGuardian();

  return {
    user: userProfile,
    isAuthenticated: true, // Demo-ready instant authentication
    login: async (email: string) => {
      updateUserProfile({ email });
    },
    signup: async (fullName: string, phone: string, email: string) => {
      updateUserProfile({ fullName, phone, email });
    },
    logout: async () => {
      // Demo logout
    },
  };
}
