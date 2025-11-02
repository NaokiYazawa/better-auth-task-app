import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { invitations, members } from "@/db/schema";

/**
 * 既存メンバーをチェック
 *
 * @param organizationId - 組織ID
 * @param userId - ユーザーID
 * @returns 既存メンバー情報（存在する場合）
 */
export async function checkExistingMember(
  organizationId: string,
  userId: string,
) {
  const [existingMember] = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.organizationId, organizationId),
        eq(members.userId, userId),
      ),
    )
    .limit(1);

  return existingMember;
}

/**
 * メンバーを追加し、招待のstatusを"accepted"に更新（バッチ処理）
 *
 * Neon HTTP Batch API を使用:
 * - 複数のクエリを1つの HTTP リクエストで実行
 * - ほぼアトミックな動作を保証
 * - Edge Runtime 互換
 *
 * 参考: https://github.com/drizzle-team/drizzle-orm-docs/blob/main/src/content/docs/batch-api.mdx
 */
export async function acceptInvitationMutation({
  invitationId,
  organizationId,
  userId,
  role,
}: {
  invitationId: string;
  organizationId: string;
  userId: string;
  role: string | null;
}) {
  const memberId = crypto.randomUUID();

  // バッチ API で複数クエリをほぼアトミックに実行
  await db.batch([
    // メンバーを追加
    db
      .insert(members)
      .values({
        id: memberId,
        organizationId,
        userId,
        role: role || "member",
        createdAt: new Date(),
      }),

    // 招待のstatusを"accepted"に更新
    db
      .update(invitations)
      .set({
        status: "accepted",
      })
      .where(eq(invitations.id, invitationId)),
  ]);
}

/**
 * 招待のstatusを"declined"に更新
 *
 * @param invitationId - 招待ID
 */
export async function declineInvitationMutation(invitationId: string) {
  await db
    .update(invitations)
    .set({
      status: "declined",
    })
    .where(eq(invitations.id, invitationId));
}
