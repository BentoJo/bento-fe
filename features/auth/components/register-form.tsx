"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { ChevronLeft, Loader2, Mail, User } from "lucide-react";
import Link from "next/link";

import { getErrorMessage } from "@/shared/types/api/errors";
import { storeDeviceId } from "@/shared/lib/auth/session";
import { Register } from "@/features/auth/api/register";
import { VerifyOtp } from "@/features/auth/api/verify-otp";
import { ResendOtp } from "@/features/auth/api/resend-otp";
import { RegisterFormValues } from "@/features/auth/types/login";
import { useResendTimer } from "@/features/auth/hooks/use-resend-timer";
import { OtpSlots } from "@/features/auth/components/otp-slots";
import FormContainer from "@/shared/components/form/form-container";
import { FormHeader } from "@/shared/components/form/form-header";
import { FormBody } from "@/shared/components/form/form-body";
import { FormFooter } from "@/shared/components/form/form-footer";
import StepImage from "@/shared/components/step-image";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Button } from "@/shared/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";

export function RegisterForm() {
  const router = useRouter();
  const {
    handleSubmit,
    control,
    setError,
    clearErrors,
    resetField,
    setFocus,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: { firstName: "", lastName: "", email: "", otp: "" },
  });

  const [step, setStep] = useState<"register" | "otp">("register");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [otpExpiresIn, setOtpExpiresIn] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const { remaining, formatted, start: startResendTimer, reset: resetTimer } =
    useResendTimer();

  const isOtpStep = step === "otp";
  const isEmailStep = step === "register";

  const handleRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await Register(values);
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
          getErrorMessage(err) || "Failed to register. Please try again.",
      });
    }
  };

  const handleOtpSubmit = async (values: RegisterFormValues) => {
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

        // deviceId/session now arrive via httpOnly cookies; the body may omit them.
        if (session?.deviceId) {
          storeDeviceId(session.deviceId);
        }

        const result = await signIn("credentials", {
          accessToken,
          refreshToken: "",
          user: JSON.stringify(user),
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/home");
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
        startResendTimer(response.resendAfter ?? 60);
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

  const handleBackToRegister = () => {
    setStep("register");
    resetField("otp");
    clearErrors("otp");
    setOtpExpiresIn(null);
    resetTimer();
    setFocus("email");
  };

  const onSubmit = handleSubmit(
    isOtpStep ? handleOtpSubmit : handleRegisterSubmit,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EEF2F8]">
    <div className="w-full max-w-[1500px] rounded-[32px] border border-[#E4EAF5] bg-[#F5F7FC] p-6 lg:p-10">
  <div className="flex flex-col-reverse lg:flex-row-reverse items-center justify-between gap-10">        
<div className="hidden lg:flex w-[90%] items-center justify-center">
  <StepImage
    width={3000}
    height={3000}
    src={isOtpStep ? "/auth/enter-otp.png" : "/auth/register-new.png"}
    alt="ManeJo registration"
    className="h-auto w-full max-w-[800px] object-contain"
  />
</div>

<FormContainer className="w-full max-w-[520px] rounded-[24px] bg-white  border-[#E4EAF5] px-8 py-10 lg:px-12 lg:py-12 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            {isOtpStep && (
  <div className="mb-8 flex justify-center">
    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#DCE9FF]">
      <Mail className="h-10 w-10 text-[#2F66EA]" />
    </div>
  </div>
)}
            <FormHeader
            title={
  isOtpStep ? (
    <div className="text-[#0F172A]"> Check your Email</div>
  ) : (
    <div className="text-[#0F172A]">
      Create Your Account
    </div>
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
              <FieldGroup className="gap-6">
                  {isEmailStep && (
                  <>
                    <div className="flex items-center gap-4">
                      <Controller
                        name="firstName"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="firstName"  className="mb-2 text-sm font-medium text-[#1E293B]">
                              First Name
                            </FieldLabel>
                            <InputGroup className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-5 shadow-none">
                              <InputGroupAddon align="inline-start">
                               <User className="size-4 text-[#94A3B8]" />
                              </InputGroupAddon>
                              <InputGroupInput
                                {...field}
                                id="firstName"
                                type="text"
                                placeholder="First Name"
                                autoComplete="given-name"
                                aria-invalid={fieldState.invalid}
                                  className="text-[#334155] placeholder:text-[#94A3B8]"
                              />
                            </InputGroup>
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )}
                      />
                      <Controller
                        name="lastName"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="lastName"  className="mb-2 text-sm font-medium text-[#1E293B]">
                              Last Name
                            </FieldLabel>
                            <InputGroup className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-5 shadow-none">
                              <InputGroupAddon align="inline-start">
                               <User className="size-4 text-[#94A3B8]" />
                              </InputGroupAddon>
                              <InputGroupInput
                                {...field}
                                id="lastName"
                                type="text"
                                placeholder="Last Name"
                                autoComplete="family-name"
                                aria-invalid={fieldState.invalid}
                                  className="text-[#334155] placeholder:text-[#94A3B8]" 
                              />
                            </InputGroup>
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )}
                      />
                    </div>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="email"  className="mb-2 text-sm font-medium text-[#1E293B]">Email</FieldLabel>
                          <InputGroup className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-5 shadow-none">
                            <InputGroupAddon align="inline-start">
                             <Mail className="size-4 text-[#94A3B8]" />
                            </InputGroupAddon>
                            <InputGroupInput
                              {...field}
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              autoComplete="email"
                              aria-invalid={fieldState.invalid}
                              className="text-[#334155] placeholder:text-[#94A3B8]"          
                                                />
                          </InputGroup>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  </>
                )}

                {isOtpStep && (
                  <Controller
                    name="otp"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="otp">Enter Code :</FieldLabel>
                        <div className="flex items-center gap-3  bg-white">
                          <OtpSlots
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            disabled={field.disabled}
                          />
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
                  {isOtpStep ? (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        onClick={handleBackToRegister}
                        disabled={isSubmitting || isResending}
                        variant="outline"
                        size="lg"
                        className="w-full cursor-pointer border-[#E2E8F0] bg-transparent text-[#0F172A] hover:bg-white hover:scale-[1.01]"
                      >
                        <ChevronLeft className="size-4" />
                        Use Different Email
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || isResending}
                        size="lg"
                        className="w-full bg-blue-500 text-white hover:bg-blue-500/85 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Verify code"
                        )}
                      </Button>
                    </div>
                  ) : (
                   
                     <div className="flex justify-center"> <Button
                      type="submit"
                      disabled={isSubmitting || isResending}
                      size="lg"
                       className="h-12 w-[180px] rounded-lg bg-[#2F66EA] text-white hover:bg-[#2458D8]"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Send Code"
                      )}
                    </Button>
                    </div>
                  )}
                </div>
              </FieldGroup>
            </form>
          </FormBody>
          <FormFooter step={isOtpStep ? 2 : 1} totalSteps={2}>
            {isEmailStep && (
              <p className="text-center text-xs text-[#64748B]">
                Have an account ?{" "}
                <Link href="/auth/login" className="text-blue-400 font-bold">
                  Sign In
                </Link>
              </p>
            )}
            {isOtpStep && (
              <p className="text-center text-xs text-[#64748B]">
                Didn&apos;t receive a code ?{" "}
                <Button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={
                    isSubmitting ||
                    isResending ||
                    !submittedEmail.trim() ||
                    remaining !== null
                  }
                  className="text-[#2563EB] font-bold bg-transparent border-0 p-0 text-xs"
                >
                  Resend code {remaining !== null ? `in ${formatted}` : "now"}
                </Button>
              </p>
            )}
          </FormFooter>
        </FormContainer>
      </div>
      </div>
    </main>
  );
}
