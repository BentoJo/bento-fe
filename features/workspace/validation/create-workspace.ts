import { z } from "zod";

/**
 * Validation for the Create Workspace modal.
 *
 * Only `name` and an optional `logoUrl` are wired to the backend
 * (createWorkspace accepts ONLY { name, logoUrl? }).
 *
 * TODO(BE): workspace URL/slug, icon-set picker, and invite-members
 * are not supported by the backend yet — those fields are rendered
 * disabled in the UI and intentionally excluded from this schema.
 */
export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Workspace name is required.")
    .max(100, "Workspace name must be 100 characters or fewer."),
  logoUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal("")),
});

export type CreateWorkspaceValues = z.infer<typeof createWorkspaceSchema>;
