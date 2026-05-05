import { create } from "zustand";
import type { UserInfo } from "@/types/auth";

interface AuthStore {
  // User state
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;

  // Registration state
  registrationEmail: string;
  registrationFirstName: string;
  registrationLastName: string;
  setRegistrationData: (
    email: string,
    firstName: string,
    lastName: string,
  ) => void;

  // Auth form state
  currentAuthStep: "initial" | "otp";
  authMode: "register" | "login" | null;
  setAuthStep: (step: "initial" | "otp", mode: "register" | "login") => void;
  resetAuthFlow: () => void;

  // Loading and error states
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  registrationEmail: "",
  registrationFirstName: "",
  registrationLastName: "",
  setRegistrationData: (email, firstName, lastName) =>
    set({
      registrationEmail: email,
      registrationFirstName: firstName,
      registrationLastName: lastName,
    }),

  currentAuthStep: "initial",
  authMode: null,
  setAuthStep: (step, mode) => set({ currentAuthStep: step, authMode: mode }),
  resetAuthFlow: () =>
    set({
      currentAuthStep: "initial",
      authMode: null,
      registrationEmail: "",
      registrationFirstName: "",
      registrationLastName: "",
      error: null,
    }),

  isLoading: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
