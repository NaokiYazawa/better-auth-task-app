import { z } from "zod";

/**
 * 招待作成のスキーマ
 */
export const createInvitationSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください" })
    .min(1, { message: "メールアドレスは必須です" }),
  role: z.enum(["owner", "admin", "member"], {
    required_error: "ロールを選択してください",
  }),
});

/**
 * 招待キャンセルのスキーマ
 */
export const cancelInvitationSchema = z.object({
  invitationId: z.string().min(1, { message: "招待IDは必須です" }),
});

/**
 * 招待再送信のスキーマ
 */
export const resendInvitationSchema = z.object({
  invitationId: z.string().min(1, { message: "招待IDは必須です" }),
});

/**
 * メンバー削除のスキーマ
 */
export const removeMemberSchema = z.object({
  memberId: z.string().min(1, { message: "メンバーIDは必須です" }),
});

export type CreateInvitationValues = z.infer<typeof createInvitationSchema>;
export type CancelInvitationValues = z.infer<typeof cancelInvitationSchema>;
export type ResendInvitationValues = z.infer<typeof resendInvitationSchema>;
export type RemoveMemberValues = z.infer<typeof removeMemberSchema>;
