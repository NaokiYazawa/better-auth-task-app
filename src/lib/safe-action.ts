import { headers } from "next/headers";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { z } from "zod";
import { isUserMemberOfOrganization } from "@/db/queries";
import { auth } from "./auth";

/**
 * カスタムエラークラス
 * Expected Errors として使用し、詳細なエラーメッセージをユーザーに返す
 */
export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

/**
 * ベース Action Client
 * - handleServerError で Uncaught Exceptions を集中管理
 * - デフォルトのバリデーションエラー形式（"formatted"）を使用
 *
 * 根拠:
 * 1. Next Safe Action のデフォルトは "formatted" 形式
 * 2. @next-safe-action/adapter-react-hook-form は "formatted" 形式を期待
 * 3. "formatted" 形式: { _errors: [], field: { _errors: [...] } }
 * 4. "flattened" 形式は React Hook Form との統合で問題が発生する
 */
export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },

  // サーバーエラーの集中管理
  handleServerError(e, utils) {
    const { clientInput, metadata } = utils;

    // ログ出力（開発環境では詳細、本番環境では最小限）
    if (process.env.NODE_ENV === "development") {
      console.error(`[${metadata?.actionName}] Action error:`, {
        message: e.message,
        clientInput,
        stack: e.stack,
      });
    } else {
      console.error(`[${metadata?.actionName}] Action error:`, e.message);
    }

    // 本番環境: エラートラッキングサービスに送信（必要に応じて実装）
    // if (process.env.NODE_ENV === "production") {
    //   reportToSentry(e, { metadata, clientInput });
    // }

    // ActionError は詳細なメッセージを返す（Expected Error として扱う）
    if (e instanceof ActionError) {
      return e.message;
    }

    // その他のエラーはマスク（セキュリティのため詳細を隠す）
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new ActionError("認証が必要です。ログインしてください。");
  }

  return next({
    ctx: {
      userId: session.user.id,
    },
  });
});

/**
 * Organization Action Client
 *
 * 組織に関連するアクション用のクライアント
 * - ユーザー認証の確認
 * - activeOrganizationId の存在確認
 * - 組織メンバーシップの検証（重要なセキュリティ層）
 *
 * セキュリティの多層防御 (Defense in Depth):
 * 1. Layout: ページロード時の検証と自動修正
 * 2. orgActionClient: アクション実行時の検証
 *
 * この2重の検証により、以下のシナリオから保護:
 * - 組織から削除されたユーザーが、削除前のセッションでアクションを試みる
 * - activeOrganizationId を不正に変更してアクセスを試みる
 * - レースコンディション（削除とアクション実行のタイミング）
 */
export const orgActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new ActionError("認証が必要です。ログインしてください。");
  }

  // better-auth の organization プラグインにより、
  // セッション作成時に activeOrganizationId が設定される
  // （src/lib/auth.ts の databaseHooks.session.create を参照）
  if (!session.session.activeOrganizationId) {
    throw new ActionError(
      "組織が設定されていません。組織を作成または選択してください。",
    );
  }

  const userId = session.user.id;
  const organizationId = session.session.activeOrganizationId;
  const isMember = await isUserMemberOfOrganization(userId, organizationId);

  if (!isMember) {
    throw new ActionError(
      "この組織へのアクセス権がありません。組織から削除された可能性があります。",
    );
  }

  return next({
    ctx: {
      userId,
      organizationId,
    },
  });
});
