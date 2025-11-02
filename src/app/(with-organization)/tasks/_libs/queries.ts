import { desc, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { tasks, users } from "@/db/schema";

/**
 * 組織のタスク一覧を取得（ユーザー情報を含む）
 */
export async function getOrganizationTasks(organizationId: string) {
  return await db
    .select({
      id: tasks.id,
      title: tasks.title,
      completed: tasks.completed,
      dueDate: tasks.dueDate,
      priority: tasks.priority,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(tasks)
    .innerJoin(users, eq(tasks.userId, users.id))
    .where(eq(tasks.organizationId, organizationId))
    .orderBy(desc(tasks.createdAt));
}

/**
 * タスク一覧の型定義
 */
export type OrganizationTask = Awaited<
  ReturnType<typeof getOrganizationTasks>
>[number];
