"use server";

import { revalidatePath } from "next/cache";
import { orgActionClient } from "@/lib/safe-action";
import {
  createTask,
  deleteTask,
  toggleTaskComplete,
  updateTask,
} from "./_libs/mutations";
import {
  createTaskSchema,
  deleteTaskSchema,
  toggleTaskCompleteSchema,
  updateTaskSchema,
} from "./_libs/schema";

/**
 * タスク作成アクション
 *
 * - orgActionClient を使用した型安全なサーバーアクション
 * - 組織メンバーシップが自動的に検証される
 * - ctx から userId と organizationId を取得
 *
 * セキュリティ:
 * - orgActionClient により、ユーザーが組織のメンバーであることを確認
 * - 削除されたメンバーはアクションを実行できない
 *
 * フロー:
 * 1. orgActionClient が組織メンバーシップを検証
 * 2. タスクを作成
 * 3. キャッシュを無効化（revalidatePath）
 * 4. 成功レスポンスを返す
 */
export const createTaskAction = orgActionClient
  .metadata({ actionName: "createTask" })
  .inputSchema(createTaskSchema)
  .action(
    async ({
      parsedInput: { title, dueDate, priority },
      ctx: { userId, organizationId },
    }) => {
      // タスクIDを生成
      const taskId = crypto.randomUUID();

      // タスクを作成（Uncaught Exception は handleServerError でキャッチ）
      const task = await createTask({
        id: taskId,
        title,
        dueDate,
        priority,
        organizationId,
        userId,
      });

      // キャッシュを無効化
      revalidatePath("/tasks");

      // 成功レスポンスを返す
      return {
        success: true,
        taskId: task.id,
        taskTitle: task.title,
      };
    },
  );

/**
 * タスク完了トグルアクション
 *
 * orgActionClient により組織メンバーシップが検証される
 */
export const toggleTaskCompleteAction = orgActionClient
  .metadata({ actionName: "toggleTaskComplete" })
  .inputSchema(toggleTaskCompleteSchema)
  .action(async ({ parsedInput: { id } }) => {
    await toggleTaskComplete(id);

    // キャッシュを無効化
    revalidatePath("/tasks");

    return {
      success: true,
      taskId: id,
    };
  });

/**
 * タスク更新アクション
 *
 * orgActionClient により組織メンバーシップが検証される
 */
export const updateTaskAction = orgActionClient
  .metadata({ actionName: "updateTask" })
  .inputSchema(updateTaskSchema)
  .action(async ({ parsedInput: { id, title, dueDate, priority } }) => {
    const task = await updateTask({
      id,
      title,
      dueDate: dueDate || null,
      priority,
    });

    // キャッシュを無効化
    revalidatePath("/tasks");

    return {
      success: true,
      taskId: task.id,
      taskTitle: task.title,
    };
  });

/**
 * タスク削除アクション
 *
 * orgActionClient により組織メンバーシップが検証される
 */
export const deleteTaskAction = orgActionClient
  .metadata({ actionName: "deleteTask" })
  .inputSchema(deleteTaskSchema)
  .action(async ({ parsedInput: { id } }) => {
    await deleteTask(id);

    // キャッシュを無効化
    revalidatePath("/tasks");

    return {
      success: true,
      taskId: id,
    };
  });
