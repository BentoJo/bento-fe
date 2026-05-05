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
  currentAuthStep: "initial" | "otp"; // "initial" for register/login form, "otp" for OTP verification
  authMode: "register" | "login" | null; // Which auth flow are we in
  setAuthStep: (step: "initial" | "otp", mode: "register" | "login") => void;
  resetAuthFlow: () => void;

  // Loading and error states
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
