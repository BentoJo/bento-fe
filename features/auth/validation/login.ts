import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export interface LoginResponse {
  success: boolean;
  message: string;
}