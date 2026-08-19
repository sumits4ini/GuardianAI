export interface TrustedContact {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  notifyOnHighRisk: boolean;
  notifyOnSos: boolean;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  fullName: string;
  phone: string;
  emergencyNotes?: string;
  contacts: TrustedContact[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}
