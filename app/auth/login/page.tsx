"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getErrorMessage } from "@/types/api/errors";
import { storeDeviceId } from "@/lib/auth/session";
import { Login } from "@/actions/auth/login";
import { VerifyOtp } from "@/actions/auth/verify-otp";
import { ResendOtp } from "@/actions/auth/resend-otp";
import Image from "next/image";
import FormContainer from "@/components/form/form-container";
import { FormHeader } from "@/components/form/form-header";
import { FormBody } from "@/components/form/form-body";
import { FormFooter } from "@/components/form/form-footer";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft, KeyRound, Loader2, Mail, RefreshCw } from "lucide-react";
import { LoginFormValues } from "@/types/auth/login";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const {
    handleSubmit,
    control,
    setError,
    clearErrors,
    resetField,
    setFocus,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const [step, setStep] = useState<"login" | "otp">("login");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [otpExpiresIn, setOtpExpiresIn] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleLoginSubmit = async (values: LoginFormValues) => {
    try {
      const response = await Login(values);

      if (response.success) {
        setSubmittedEmail(values.email);
        setStep("otp");
        resetField("otp");
        clearErrors("otp");
        setFocus("otp");
      }
    } catch (err) {
      setError("email", {
        type: "manual",
        message:
          getErrorMessage(err) || "Failed to initiate login. Please try again.",
      });
    }
  };

  const handleOtpSubmit = async (values: LoginFormValues) => {
    try {
      const response = await VerifyOtp(values);

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
          return;
        }

        setError("otp", {
          type: "manual",
          message: "Failed to sign in. Please try again.",
        });
      }
    } catch (err) {
      setError("otp", {
        type: "manual",
        message:
          getErrorMessage(err) || "Failed to verify OTP. Please try again.",
      });
    }
  };

  const handleResendOtp = async () => {
    if (!submittedEmail.trim()) {
      setError("email", {
        type: "manual",
        message: "Please enter your email first.",
      });
      return;
    }

    try {
      setIsResending(true);
      const response = await ResendOtp({ email: submittedEmail.trim() });

      if (response.success) {
        setOtpExpiresIn(response.expiresIn);
      }
    } catch (err) {
      setError("otp", {
        type: "manual",
        message:
          getErrorMessage(err) || "Failed to resend OTP. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("login");
    resetField("otp");
    clearErrors("otp");
    setOtpExpiresIn(null);
    setFocus("email");
  };

  const isOtpStep = step === "otp";

  const onSubmit = handleSubmit(
    isOtpStep ? handleOtpSubmit : handleLoginSubmit,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617]">
      <div className="relative mx-auto flex h-fit w-full max-w-7xl items-center justify-center gap-8 lg:gap-10">
        <div className="absolute inset-y-0 left-0 z-0 w-4/6 rounded-2xl bg-[#0F172A]" />
        <Image
          width={2000}
          height={2000}
          src={"/auth/login.png"}
          alt="Kanban Board"
          className="max-w-1/2 z-10"
        />
        <>
          <FormContainer className="relative z-10">
            <FormHeader
              title={
                isOtpStep ? (
                  <>Check your Email</>
                ) : (
                  <>
                    Welcome to Mane<span className="text-blue-500">Jo</span>
                  </>
                )
              }
              subtitle={
                isOtpStep ? (
                  <>Enter the 6-digit code we sent to you</>
                ) : (
                  <>Enter your email to continue</>
                )
              }
            />
            <FormBody>
              <form onSubmit={onSubmit} className="w-full">
                <FieldGroup className="gap-6 text-white">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="email">Email :</FieldLabel>
                        <InputGroup className="w-full bg-[#1E293B] border-0 rounded-sm py-5 px-2">
                          <InputGroupAddon align="inline-start">
                            <Mail className="size-4" />
                          </InputGroupAddon>
                          <InputGroupInput
                            {...field}
                            id="email"
                            type="email"
                            placeholder="Ente your email"
                            autoComplete="email"
                            readOnly={isOtpStep}
                            aria-invalid={fieldState.invalid}
                          />
                        </InputGroup>
                        <FieldError errors={[fieldState.error]} />
                        {isOtpStep && (
                          <FieldDescription>
                            This address is tied to the verification code.
                          </FieldDescription>
                        )}
                      </Field>
                    )}
                  />

                  {isOtpStep && (
                    <Controller
                      name="otp"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="otp">
                            Verification code
                          </FieldLabel>
                          <div className="flex items-center gap-3">
                            <KeyRound className="size-4 text-[#94A3B8]" />
                            <InputOTP
                              maxLength={6}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              disabled={field.disabled}
                              containerClassName="w-full"
                            >
                              <InputOTPGroup className="w-full justify-between gap-2">
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                          <FieldError errors={[fieldState.error]} />
                          {otpExpiresIn && (
                            <FieldDescription>
                              The latest code expires in {otpExpiresIn}.
                            </FieldDescription>
                          )}
                        </Field>
                      )}
                    />
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || isResending}
                      size="lg"
                      className="w-full bg-blue-500 text-white hover:bg-blue-500/85 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : isOtpStep ? (
                        "Verify code"
                      ) : (
                        "Continue with email"
                      )}
                    </Button>

                    {isOtpStep && (
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          onClick={handleBackToLogin}
                          disabled={isSubmitting || isResending}
                          variant="outline"
                          size="lg"
                          className="w-full border-[#1E293B] bg-transparent text-white hover:bg-[#0F172A] hover:text-white"
                        >
                          <ArrowLeft className="size-4" />
                          Back
                        </Button>

                        <Button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={
                            isSubmitting ||
                            isResending ||
                            !submittedEmail.trim()
                          }
                          variant="outline"
                          size="lg"
                          className="w-full border-[#1E293B] bg-transparent text-white hover:bg-[#0F172A] hover:text-white"
                        >
                          {isResending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <RefreshCw className="size-4" />
                          )}
                          Resend code
                        </Button>
                      </div>
                    )}
                  </div>
                </FieldGroup>
              </form>
            </FormBody>
            <FormFooter step={isOtpStep ? 2 : 1} totalSteps={2}>
              <p className="text-center text-xs text-[#64748B]">
                Don&apos;t have an account ?{" "}
                <Link href="/auth/register" className="text-blue-400 font-bold">
                  Sign Up
                </Link>
              </p>
            </FormFooter>
          </FormContainer>
        </>
      </div>
    </main>
  );
}
