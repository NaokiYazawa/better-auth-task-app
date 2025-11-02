import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "タスク名は必須です" })
    .max(200, { message: "タスク名は200文字以内で入力してください" }),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "優先度を選択してください",
  }),
});

export const updateTaskSchema = z.object({
  id: z.string().min(1, { message: "タスクIDは必須です" }),
  title: z
    .string()
    .min(1, { message: "タスク名は必須です" })
    .max(200, { message: "タスク名は200文字以内で入力してください" }),
  dueDate: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "優先度を選択してください",
  }),
});

export const toggleTaskCompleteSchema = z.object({
  id: z.string().min(1, { message: "タスクIDは必須です" }),
});

export const deleteTaskSchema = z.object({
  id: z.string().min(1, { message: "タスクIDは必須です" }),
});

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskValues = z.infer<typeof updateTaskSchema>;
export type ToggleTaskCompleteValues = z.infer<typeof toggleTaskCompleteSchema>;
export type DeleteTaskValues = z.infer<typeof deleteTaskSchema>;
