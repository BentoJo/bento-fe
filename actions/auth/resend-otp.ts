import { getClientAxios } from "@/lib/api/client";
import { OtpResendResponse } from "@/types/auth";
import {
  ResendOtpRequest,
  ResendOtpSchema,
} from "@/validation/auth/resend-otp";

export async function ResendOtp(
  values: ResendOtpRequest,
): Promise<OtpResendResponse> {
  try {
    const axios = getClientAxios();

    const validatedData = ResendOtpSchema.safeParse(values);

    if (!validatedData.success) {
      throw new Error(
        "Invalid input. Please check your details and try again.",
      );
    }

    const { email } = validatedData.data;

    const response = await axios.post("/auth/resend-otp", {
      email,
    });

    return { ...response.data };
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? error.message
        : "Failed to resend OTP. Please try again.",
    );
  }
}
