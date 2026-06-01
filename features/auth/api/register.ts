import { getClientAxios } from "@/shared/lib/api/client";
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

    const response = await axios.post<RegisterResponse>("/v1/auth/register", {
      email,
      firstName,
      lastName,
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
