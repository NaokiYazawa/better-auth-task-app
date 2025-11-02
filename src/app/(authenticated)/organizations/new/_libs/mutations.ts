import { eq } from "drizzle-orm";
import { db } from "@/db";
import { members, organizations } from "@/db/schema";

/**
 * 型定義
 */
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

/**
 * スラッグから組織を取得
 * - エラーハンドリングを行わない（呼び出し側に委ねる）
 * - 見つからない場合は undefined を返す
 */
export async function getOrganizationBySlug(
  slug: string,
): Promise<Organization | undefined> {
  return await db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
  });
}

/**
 * 組織を作成
 * - エラーハンドリングを行わない（呼び出し側に委ねる）
 * - 作成した組織を返す
 */
export async function createOrganization(data: {
  id: string;
  name: string;
  slug: string;
  logo: string;
}): Promise<Organization> {
  const [organization] = await db
    .insert(organizations)
    .values({
      id: data.id,
      name: data.name,
      slug: data.slug,
      logo: data.logo,
      createdAt: new Date(),
    })
    .returning();

  return organization;
}

/**
 * メンバーを作成（組織にユーザーを追加）
 * - エラーハンドリングを行わない（呼び出し側に委ねる）
 * - 作成したメンバーを返す
 */
export async function createMember(data: {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
}): Promise<Member> {
  const [member] = await db
    .insert(members)
    .values({
      id: data.id,
      organizationId: data.organizationId,
      userId: data.userId,
      role: data.role,
      createdAt: new Date(),
    })
    .returning();

  return member;
}
