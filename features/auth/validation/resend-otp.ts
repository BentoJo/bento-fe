import { z } from "zod";

export const ResendOtpSchema = z.object({
  email: z.email(),
});

export type ResendOtpRequest = z.infer<typeof ResendOtpSchema>;
