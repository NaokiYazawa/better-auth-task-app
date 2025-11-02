import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { invitations, members, users } from "@/db/schema";

/**
 * 組織のメンバー一覧を取得
 * - ユーザー情報を含む
 * - 作成日時の降順で並び替え
 */
export async function getOrganizationMembers(organizationId: string) {
  return await db
    .select({
      id: members.id,
      role: members.role,
      createdAt: members.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .where(eq(members.organizationId, organizationId))
    .orderBy(desc(members.createdAt));
}

/**
 * 組織の招待一覧を取得
 * - 招待者のユーザー情報を含む
 * - ステータスが pending のもののみ
 */
export async function getOrganizationInvitations(organizationId: string) {
  return await db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      inviter: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(invitations)
    .innerJoin(users, eq(invitations.inviterId, users.id))
    .where(
      and(
        eq(invitations.organizationId, organizationId),
        eq(invitations.status, "pending"),
      ),
    )
    .orderBy(desc(invitations.expiresAt));
}

export type OrganizationMember = Awaited<
  ReturnType<typeof getOrganizationMembers>
>[number];

export type OrganizationInvitation = Awaited<
  ReturnType<typeof getOrganizationInvitations>
>[number];
