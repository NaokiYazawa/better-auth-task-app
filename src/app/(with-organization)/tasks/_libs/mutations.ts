import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";

/**
 * 型定義
 */
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

/**
 * タスクを作成
 * - エラーハンドリングを行わない（呼び出し側に委ねる）
 * - 作成したタスクを返す
 */
export async function createTask(data: {
  id: string;
  title: string;
  dueDate?: string;
  priority: string;
  organizationId: string;
  userId: string;
}): Promise<Task> {
  const [task] = await db
    .insert(tasks)
    .values({
      id: data.id,
      title: data.title,
      completed: false,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority,
      organizationId: data.organizationId,
      userId: data.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return task;
}

/**
 * タスクの完了状態をトグル
 */
export async function toggleTaskComplete(taskId: string): Promise<Task> {
  const [task] = await db
    .update(tasks)
    .set({
      completed: sql`NOT ${tasks.completed}`,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  return task;
}

/**
 * タスクを更新
 */
export async function updateTask(data: {
  id: string;
  title: string;
  dueDate?: string | null;
  priority: string;
}): Promise<Task> {
  const [task] = await db
    .update(tasks)
    .set({
      title: data.title,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, data.id))
    .returning();

  return task;
}

/**
 * タスクを削除
 */
export async function deleteTask(taskId: string): Promise<void> {
  await db.delete(tasks).where(eq(tasks.id, taskId));
}
