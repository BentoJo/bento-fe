import { getClientAxios } from "@/shared/lib/api/client";
import { unwrap } from "@/shared/lib/api/unwrap";
import { VerifyOtpResponse } from "@/shared/types/auth";
import {
  verifyOtp,
  VerifyOtpRequest,
} from "@/features/auth/validation/verify-otp";

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

    const response = await axios.post("/v1/auth/verify-otp", {
      email,
      code: otp,
    });

    // Gateway wraps the payload as { success, message, data } → flatten it.
    return unwrap<VerifyOtpResponse>(response);
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? error.message
        : "Failed to register. Please try again.",
    );
  }
}
