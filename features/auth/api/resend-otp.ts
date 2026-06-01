import { getClientAxios } from "@/shared/lib/api/client";
import { unwrap } from "@/shared/lib/api/unwrap";
import { OtpResendResponse } from "@/shared/types/auth";
import {
  ResendOtpRequest,
  ResendOtpSchema,
} from "@/features/auth/validation/resend-otp";

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

    const response = await axios.post("/v1/auth/resend-otp", {
      email,
    });

    return unwrap<OtpResendResponse>(response);
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? error.message
        : "Failed to resend OTP. Please try again.",
    );
  }
}
