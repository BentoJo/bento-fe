import { z } from "zod";

export const RegisterRequestSchema = z.object({
  email: z.email("Please enter a valid email address."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
