"use client";

import { useState } from "react";
import { getClientAxios } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getErrorMessage } from "@/types/api/errors";
import { storeDeviceId } from "@/lib/auth/session";
import type { AxiosErrorType } from "@/types/api/errors";
import type {
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  OtpResendResponse,
} from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();
  const axios = getClientAxios();
  const store = useAuthStore();

  // Form states
  const [step, setStep] = useState<"register" | "otp">("register");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpExpiresIn, setOtpExpiresIn] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const registerData: RegisterRequest = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      const response = await axios.post<RegisterResponse>(
        "/auth/register",
        registerData,
      );

      if (response.status === 200) {
        // Store registration data for OTP step
        store.setRegistrationData(
          formData.email,
          formData.firstName,
          formData.lastName,
        );
        setStep("otp");
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const verifyData: VerifyOtpRequest = {
        email: formData.email,
        code: formData.otp,
      };

      const response = await axios.post<VerifyOtpResponse>(
        "/auth/verify-otp",
        verifyData,
      );

      if (response.status === 200) {
        const {
          user,
          accessToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          session,
        } = response.data;

        // Store device ID for reference (tokens are in httpOnly cookies)
        storeDeviceId(session.deviceId);

        // Sign in with NextAuth using credentials provider
        // Note: refreshToken and sessionId are in httpOnly cookies, not in response body
        const result = await signIn("credentials", {
          accessToken,
          refreshToken: "", // Empty since it's in httpOnly cookie
          user: JSON.stringify(user),
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          redirect: false,
        });

        if (result?.ok) {
          // Store user in auth store
          store.setUser(user);
          // Reset auth flow
          store.resetAuthFlow();
          // Redirect to dashboard
          router.push("/dashboard");
        } else {
          setError("Failed to sign in. Please try again.");
        }
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<OtpResendResponse>("/auth/resend-otp", {
        email: formData.email,
      });

      if (response.status === 200) {
        setOtpExpiresIn(response.data.expiresIn);
        setError(null);
        // Show success message
        alert(
          `OTP resent to ${response.data.email}. Expires in ${response.data.expiresIn}`,
        );
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setStep("register");
    setFormData({ ...formData, otp: "" });
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {step === "register" ? "Create your account" : "Verify your email"}
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <form
          onSubmit={
            step === "register" ? handleRegisterSubmit : handleOtpSubmit
          }
          className="space-y-6"
        >
          {step === "register" ? (
            <>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="email-display"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email-display"
                  type="email"
                  disabled
                  value={formData.email}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter 6-digit OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="000000"
                />
              </div>

              {otpExpiresIn && (
                <p className="text-sm text-gray-600">
                  OTP expires in: {otpExpiresIn}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBackToRegister}
                  disabled={isLoading}
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
