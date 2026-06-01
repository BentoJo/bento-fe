import { getClientAxios } from "@/shared/lib/api/client";
import { unwrap } from "@/shared/lib/api/unwrap";
import {
  LoginRequest,
  LoginRequestSchema,
  LoginResponse,
} from "@/features/auth/validation/login";

export async function Login(values: LoginRequest): Promise<LoginResponse> {
  try {
    const axios = getClientAxios();

    const validatedData = LoginRequestSchema.safeParse(values);

    if (!validatedData.success) {
      throw new Error("Invalid email address. Please enter a valid email.");
    }

    const { email } = validatedData.data;

    const response = await axios.post("/v1/auth/login", {
      email,
    });

    return unwrap<LoginResponse>(response);
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? error.message
        : "Failed to initiate login. Please try again.",
    );
  }
}
