import { z } from "zod";

/**
 * Validation for the Create / Edit Team dialog.
 * `name` is required; `description` and `icon` are optional.
 * `icon` is a short text/emoji for now (no icon-set picker yet).
 * TODO(BE): swap the free-text icon for a proper icon-set picker when supported.
 */
export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Team name is required.")
    .max(100, "Team name must be 100 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  icon: z
    .string()
    .trim()
    .max(16, "Icon must be 16 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export type TeamFormValues = z.infer<typeof teamSchema>;
