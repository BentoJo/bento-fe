import { getClientAxios } from "@/shared/lib/api/client";
import { unwrap } from "@/shared/lib/api/unwrap";
import { RegisterResponse } from "@/shared/types/auth";
import {
  RegisterRequest,
  RegisterRequestSchema,
} from "@/features/auth/validation/register";

export async function Register(
  values: RegisterRequest,
): Promise<RegisterResponse> {
  try {
    const axios = getClientAxios();
    const validatedData = RegisterRequestSchema.safeParse(values);

    if (!validatedData.success) {
      throw new Error(
        "Invalid input. Please check your details and try again.",
      );
    }

    const { email, firstName, lastName } = validatedData.data;

    const response = await axios.post("/v1/auth/register", {
      email,
      firstName,
      lastName,
    });

    return unwrap<RegisterResponse>(response);
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? error.message
        : "Failed to register. Please try again.",
    );
  }
}
