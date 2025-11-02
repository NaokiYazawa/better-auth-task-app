"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { ActionError, authActionClient } from "@/lib/safe-action";
import {
  acceptInvitationMutation,
  checkExistingMember,
  declineInvitationMutation,
} from "./_libs/mutations";
import { getInvitation, getUserById } from "./_libs/queries";

const acceptInvitationSchema = z.object({
  invitationId: z.string().uuid(),
});

export const acceptInvitationAction = authActionClient
  .metadata({ actionName: "acceptInvitation" })
  .inputSchema(acceptInvitationSchema)
  .action(async ({ parsedInput: { invitationId }, ctx: { userId } }) => {
    const user = await getUserById(userId);

    if (!user) {
      throw new ActionError("ユーザー情報が見つかりません");
    }

    const invitation = await getInvitation(invitationId);

    if (!invitation) {
      throw new ActionError("招待が見つかりません");
    }

    if (invitation.expiresAt < new Date()) {
      throw new ActionError("この招待は有効期限が切れています");
    }

    if (invitation.status !== "pending") {
      throw new ActionError(
        `この招待は既に${invitation.status === "accepted" ? "承認" : "処理"}されています`,
      );
    }

    if (user.email !== invitation.email) {
      throw new ActionError(
        "招待されたメールアドレスと現在のアカウントのメールアドレスが一致しません",
      );
    }

    const existingMember = await checkExistingMember(
      invitation.organizationId,
      userId,
    );

    if (existingMember) {
      throw new ActionError("既にこの組織のメンバーです");
    }

    await acceptInvitationMutation({
      invitationId,
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
    });

    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {
        organizationId: invitation.organizationId,
      },
    });

    return {
      success: true,
      organizationId: invitation.organizationId,
    };
  });

const declineInvitationSchema = z.object({
  invitationId: z.string().uuid(),
});

export const declineInvitationAction = authActionClient
  .metadata({ actionName: "declineInvitation" })
  .inputSchema(declineInvitationSchema)
  .action(async ({ parsedInput: { invitationId }, ctx: { userId } }) => {
    const user = await getUserById(userId);

    if (!user) {
      throw new ActionError("ユーザー情報が見つかりません");
    }

    const invitation = await getInvitation(invitationId);

    if (!invitation) {
      throw new ActionError("招待が見つかりません");
    }

    if (invitation.expiresAt < new Date()) {
      throw new ActionError("この招待は有効期限が切れています");
    }

    if (invitation.status !== "pending") {
      throw new ActionError(
        `この招待は既に${invitation.status === "accepted" ? "承認" : "処理"}されています`,
      );
    }

    if (user.email !== invitation.email) {
      throw new ActionError(
        "招待されたメールアドレスと現在のアカウントのメールアドレスが一致しません",
      );
    }

    await declineInvitationMutation(invitationId);

    return {
      success: true,
    };
  });

/**
 * 招待承認ラッパー関数
 *
 * 根拠:
 * 1. next-safe-action の result 構造を適切に処理
 * 2. serverError があればそれを優先的に返す（詳細なエラーメッセージ）
 * 3. validationErrors も返す（フィールドレベルのエラー）
 * 4. クライアント側で適切にハンドリングできるよう、エラー情報を含むオブジェクトを返す
 */
export async function acceptInvitation(invitationId: string) {
  const result = await acceptInvitationAction({ invitationId });

  // サーバーエラーがある場合（ActionError など）
  if (result?.serverError) {
    return {
      success: false,
      error: result.serverError,
    };
  }

  // データが正常に返された場合
  if (result?.data) {
    return {
      success: true,
      data: result.data,
    };
  }

  // 予期しないエラー
  return {
    success: false,
    error: "招待の承認に失敗しました",
  };
}

export async function declineInvitation(invitationId: string) {
  const result = await declineInvitationAction({ invitationId });

  // サーバーエラーがある場合（ActionError など）
  if (result?.serverError) {
    return {
      success: false,
      error: result.serverError,
    };
  }

  // データが正常に返された場合
  if (result?.data) {
    return {
      success: true,
      data: result.data,
    };
  }

  // 予期しないエラー
  return {
    success: false,
    error: "招待の拒否に失敗しました",
  };
}
