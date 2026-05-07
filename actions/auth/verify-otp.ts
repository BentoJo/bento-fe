import { getClientAxios } from "@/lib/api/client";
import { VerifyOtpResponse } from "@/types/auth";
import { verifyOtp, VerifyOtpRequest } from "@/validation/auth/verify-otp";

export async function VerifyOtp(
  values: VerifyOtpRequest,
): Promise<VerifyOtpResponse> {
  try {
    const axios = getClientAxios();

    const validatedData = verifyOtp.safeParse(values);

    if (!validatedData.success) {
      throw new Error(
        "Invalid input. Please check your details and try again.",
      );
    }

    const { email, otp } = validatedData.data;

    const response = await axios.post<VerifyOtpResponse>("/v1/auth/verify-otp", {
      email,
      code: otp,
    });

    return {
      ...response.data,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? error.message
        : "Failed to register. Please try again.",
    );
  }
}
