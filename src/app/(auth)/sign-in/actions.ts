"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

/**
 * Google OAuth認証アクション
 *
 * Better Auth の公式 API（auth.api.signInSocial）を使用:
 * 1. auth.api.signInSocial() を呼び出し
 * 2. 戻り値から OAuth URL を取得（response.url）
 * 3. Next.js の redirect() で明示的にリダイレクト
 * 4. Google OAuth 認証ページへ遷移
 * 5. 認証成功後、callbackURL または newUserCallbackURL にリダイレクト
 * 6. セッション作成時に activeOrganizationId が自動設定（src/lib/auth.ts:21-55 の databaseHooks）
 *
 * 根拠（Better Auth の型定義から確認）:
 * - auth.api.signInSocial() はデフォルトで Response オブジェクトを返さない
 * - 代わりに { url: string, redirect: boolean } を返す
 * - url プロパティに OAuth プロバイダーの認証 URL が含まれる
 * - この URL に対して明示的に redirect() を呼び出す必要がある
 *
 * 型定義（node_modules/better-auth/dist/shared/better-auth.B955zZIT.d.ts:2161-2196）:
 * Promise<{
 *   url: string;        // ← OAuth 認証 URL
 *   redirect: boolean;  // ← リダイレクトが必要
 * } | {
 *   token: string;
 *   url: undefined;
 *   user: {...};
 * }>
 */

const googleSignInSchema = z.object({
  redirectTo: z.string().optional(),
});

/**
 * Google OAuth サインインアクション
 *
 * @param redirectTo - 認証後のリダイレクト先（オプション）
 *
 * フロー:
 * 1. auth.api.signInSocial() を実行
 * 2. 戻り値から url プロパティを取得
 * 3. url が存在する場合、redirect() でリダイレクト
 * 4. Google OAuth フローが開始
 * 5. 認証成功後のリダイレクト:
 *    - 新規ユーザー: newUserCallbackURL（/organizations/new）
 *    - 既存ユーザー: callbackURL（/tasks）
 *
 * 重要:
 * - auth.api.signInSocial() は { url: string, redirect: boolean } を返す
 * - この url を使って明示的に redirect() を呼び出す必要がある
 * - redirect() は例外をスローして処理を中断する（Next.jsの仕様）
 * - エラーハンドリングは src/lib/safe-action.ts:33-59 の handleServerError で集中管理
 */
export const signInWithGoogleAction = actionClient
  .metadata({ actionName: "signInWithGoogle" })
  .inputSchema(googleSignInSchema)
  .action(async ({ parsedInput: { redirectTo } }) => {
    // コールバックURLを設定
    const callbackURL = redirectTo || "/tasks";
    const newUserCallbackURL = redirectTo || "/organizations/new";

    // Better Auth の公式 API を使用して OAuth URL を取得
    const result = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL,
        newUserCallbackURL,
      },
    });

    // 戻り値から OAuth URL を取得
    // 型定義: { url: string, redirect: boolean } | { token: string, url: undefined, user: {...} }
    if ("url" in result && result.url) {
      // OAuth 認証 URL にリダイレクト
      // これにより Google OAuth フローが開始される
      redirect(result.url);
    }

    // url が存在しない場合はエラー
    // （通常の OAuth フローでは url は必ず存在する）
    throw new Error(
      "OAuth リダイレクト URL が取得できませんでした。設定を確認してください。",
    );
  });
