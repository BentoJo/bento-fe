import { z } from "zod";

export const verifyOtp = z.object({
  email: z.email("Please enter a valid email address."),
  otp: z.string().min(6, "OTP must be at least 6 characters long."),
});

export type VerifyOtpRequest = z.infer<typeof verifyOtp>;