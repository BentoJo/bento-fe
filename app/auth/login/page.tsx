"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getErrorMessage } from "@/types/api/errors";
import { storeDeviceId } from "@/lib/auth/session";
import { Login } from "@/actions/auth/login";
import { VerifyOtp } from "@/actions/auth/verify-otp";
import { ResendOtp } from "@/actions/auth/resend-otp";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"login" | "otp">("login");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpExpiresIn, setOtpExpiresIn] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await Login({ email: formData.email });

      if (response.success) {
        setStep("otp");
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || "Failed to initiate login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await VerifyOtp({
        email: formData.email,
        otp: formData.otp,
      });

      if (response.success) {
        const {
          accessToken,
          user,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          session,
        } = response;

        storeDeviceId(session.deviceId);

        const result = await signIn("credentials", {
          accessToken,
          refreshToken: "",
          user: JSON.stringify(user),
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          redirect: false,
        });

        if (result?.ok) {
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
      const response = await ResendOtp({ email: formData.email });

      if (response.success) {
        setOtpExpiresIn(response.expiresIn);
        setError(null);
        alert(
          `OTP resent to ${response.email}. Expires in ${response.expiresIn}`,
        );
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("login");
    setFormData({ ...formData, otp: "" });
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {step === "login" ? "Sign in to your account" : "Verify your email"}
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <form
          onSubmit={step === "login" ? handleLoginSubmit : handleOtpSubmit}
          className="space-y-6"
        >
          {step === "login" ? (
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Sending OTP..." : "Continue"}
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
                  onClick={handleBackToLogin}
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
          Don&apos;t have an account?{" "}
          <a
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
