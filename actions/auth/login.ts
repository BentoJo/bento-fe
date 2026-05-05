import { getClientAxios } from "@/lib/api/client";
import {
  LoginRequest,
  LoginRequestSchema,
  LoginResponse,
} from "@/validation/auth/login";

export async function Login(values: LoginRequest): Promise<LoginResponse> {
  try {
    const axios = getClientAxios();

    const validatedData = LoginRequestSchema.safeParse(values);

    if (!validatedData.success) {
      throw new Error("Invalid email address. Please enter a valid email.");
    }

    const { email } = validatedData.data;

    const response = await axios.post<LoginResponse>("/auth/login", {
      email,
    });

    return {
      ...response.data,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? error.message
        : "Failed to initiate login. Please try again.",
    );
  }
}
