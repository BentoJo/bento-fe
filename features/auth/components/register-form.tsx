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
    <main className="flex min-h-screen items-center justify-center bg-[#020617]">
      <div className="relative mx-auto flex h-fit w-full max-w-7xl items-center justify-center flex-row-reverse gap-8 lg:gap-10">
        <div className="absolute inset-y-0 right-0 z-0 w-9/12 rounded-2xl bg-[#0F172A]" />
        <StepImage
          width={2000}
          height={2000}
          src={isOtpStep ? "/auth/enter-otp.png" : "/auth/register.png"}
          alt="ManeJo registration"
          className="max-w-3/5 z-10"
        />
        <FormContainer className="relative z-10">
          <FormHeader
            title={isOtpStep ? <>Check your Email</> : <>Create Your Account</>}
            subtitle={
              isOtpStep ? (
                <>Enter the 6-digit code we sent to you</>
              ) : (
                <>Let&apos;s get you started</>
              )
            }
          />
          <FormBody>
            <form onSubmit={onSubmit} className="w-full">
              <FieldGroup className="gap-6 text-white">
                {isEmailStep && (
                  <>
                    <div className="flex items-center gap-4">
                      <Controller
                        name="firstName"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="firstName">
                              First Name :
                            </FieldLabel>
                            <InputGroup className="w-full bg-[#1E293B] border-0 rounded-sm py-5 px-2">
                              <InputGroupAddon align="inline-start">
                                <User className="size-4" />
                              </InputGroupAddon>
                              <InputGroupInput
                                {...field}
                                id="firstName"
                                type="text"
                                placeholder="First Name"
                                autoComplete="given-name"
                                aria-invalid={fieldState.invalid}
                                className="[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_transparent_inset]"
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
                            <FieldLabel htmlFor="lastName">
                              Last Name :
                            </FieldLabel>
                            <InputGroup className="w-full bg-[#1E293B] border-0 rounded-sm py-5 px-2">
                              <InputGroupAddon align="inline-start">
                                <User className="size-4" />
                              </InputGroupAddon>
                              <InputGroupInput
                                {...field}
                                id="lastName"
                                type="text"
                                placeholder="Last Name"
                                autoComplete="family-name"
                                aria-invalid={fieldState.invalid}
                                className="[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_transparent_inset]"
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
                          <FieldLabel htmlFor="email">Email :</FieldLabel>
                          <InputGroup className="w-full bg-[#1E293B] border-0 rounded-sm py-5 px-2">
                            <InputGroupAddon align="inline-start">
                              <Mail className="size-4" />
                            </InputGroupAddon>
                            <InputGroupInput
                              {...field}
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              autoComplete="email"
                              aria-invalid={fieldState.invalid}
                              className="[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_transparent_inset]"
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
                        <div className="flex items-center gap-3">
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
                        className="w-full cursor-pointer border-[#1E293B] bg-transparent text-white hover:bg-[#0F172A] hover:text-white"
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
                    <Button
                      type="submit"
                      disabled={isSubmitting || isResending}
                      size="lg"
                      className="w-full bg-blue-500 text-white hover:bg-blue-500/85 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Send Code"
                      )}
                    </Button>
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
                  className="text-blue-400 font-bold bg-transparent border-0 p-0 text-xs"
                >
                  Resend code {remaining !== null ? `in ${formatted}` : "now"}
                </Button>
              </p>
            )}
          </FormFooter>
        </FormContainer>
      </div>
    </main>
  );
}
