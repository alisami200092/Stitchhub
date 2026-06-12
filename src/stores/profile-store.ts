// ──────────────────────────────────────────────
// profile-store.ts — Partner profile / dashboard state
// ──────────────────────────────────────────────

import { create } from "zustand";
import type { EscalationLog, Invoice, ProfileTab } from "@/types";

interface ProfileUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

interface ProfileState {
  activeTab: ProfileTab;
  user: ProfileUser | null;
  logs: EscalationLog[];
  invoices: Invoice[];
  selectedLog: EscalationLog | null;
  loading: boolean;
  profileName: string;
  routingEmail: string;
  isUpdatingProfile: boolean;
  mfaEnabled: boolean;

  setActiveTab: (tab: ProfileTab) => void;
  setUser: (user: ProfileUser | null) => void;
  setLogs: (logs: EscalationLog[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setSelectedLog: (log: EscalationLog | null) => void;
  setLoading: (loading: boolean) => void;
  setProfileName: (name: string) => void;
  setRoutingEmail: (email: string) => void;
  setIsUpdatingProfile: (val: boolean) => void;
  toggleMfa: () => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  activeTab: "inbox",
  user: null,
  logs: [],
  invoices: [],
  selectedLog: null,
  loading: true,
  profileName: "",
  routingEmail: "",
  isUpdatingProfile: false,
  mfaEnabled: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setUser: (user) => set({ user }),
  setLogs: (logs) => set({ logs }),
  setInvoices: (invoices) => set({ invoices }),
  setSelectedLog: (selectedLog) => set({ selectedLog }),
  setLoading: (loading) => set({ loading }),
  setProfileName: (profileName) => set({ profileName }),
  setRoutingEmail: (routingEmail) => set({ routingEmail }),
  setIsUpdatingProfile: (isUpdatingProfile) => set({ isUpdatingProfile }),
  toggleMfa: () => set((state) => ({ mfaEnabled: !state.mfaEnabled })),
}));
