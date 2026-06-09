import { z } from "zod";

/**
 * Validation for the Create Board modal and Create Task drawer.
 * Manual `safeParse` is used in the dialogs (matches the existing
 * create-team / create-workspace pattern — @hookform/resolvers is not installed).
 */
export const boardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Board name is required.")
    .max(100, "Board name must be 100 characters or fewer."),
  isPrivate: z.boolean(),
  icon: z
    .string()
    .trim()
    .max(16, "Icon must be 16 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export type BoardFormValues = z.infer<typeof boardSchema>;

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(200, "Task title must be 200 characters or fewer."),
  descriptionText: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer.")
    .optional()
    .or(z.literal("")),
  status: z.string().optional(),
  isPrivate: z.boolean(),
  recurring: z.string().optional(),
  startDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
