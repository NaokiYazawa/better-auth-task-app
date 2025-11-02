"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { acceptInvitation, declineInvitation } from "../actions";
import { InvitationConfirmation } from "./invitation-confirmation";

interface InvitationConfirmationWrapperProps {
  invitationId: string;
  organizationName: string;
  inviterName: string;
}

/**
 * 招待確認ラッパーコンポーネント
 *
 * 根拠:
 * 1. Server Action の結果を適切に処理
 * 2. エラーメッセージを toast で表示（UX 向上）
 * 3. 成功時はリダイレクト
 * 4. エラーはスローせず、InvitationConfirmation に伝播させる
 */
export function InvitationConfirmationWrapper({
  invitationId,
  organizationName,
  inviterName,
}: InvitationConfirmationWrapperProps) {
  const router = useRouter();

  return (
    <InvitationConfirmation
      invitationId={invitationId}
      organizationName={organizationName}
      inviterName={inviterName}
      onAccept={async (id) => {
        const result = await acceptInvitation(id);

        if (!result.success) {
          // エラーメッセージを toast で表示
          toast.error(result.error || "招待の承認に失敗しました");
          // エラーをスローして InvitationConfirmation の catch ブロックへ
          throw new Error(result.error || "招待の承認に失敗しました");
        }

        // 成功時は toast 表示してリダイレクト
        toast.success("招待を承認しました");
        router.push("/tasks");
      }}
      onDecline={async (id) => {
        const result = await declineInvitation(id);

        if (!result.success) {
          // エラーメッセージを toast で表示
          toast.error(result.error || "招待の拒否に失敗しました");
          // エラーをスローして InvitationConfirmation の catch ブロックへ
          throw new Error(result.error || "招待の拒否に失敗しました");
        }

        // 成功時は toast 表示してリダイレクト
        toast.success("招待を拒否しました");
        router.push("/");
      }}
    />
  );
}
