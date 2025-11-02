import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { db } from "@/db";
import { getUserLatestOrganizationId } from "./organization";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          try {
            const organizationId = await getUserLatestOrganizationId(
              session.userId,
            );

            // 組織に属している場合、最後に参加した組織をアクティブに設定
            if (organizationId) {
              return {
                data: {
                  ...session,
                  activeOrganizationId: organizationId,
                },
              };
            }

            // 組織に属していない場合はそのまま
            return {
              data: session,
            };
          } catch (error) {
            console.error(
              "Error setting active organization on session creation:",
              error,
            );
            // エラーが発生してもセッション作成は継続
            return {
              data: session,
            };
          }
        },
      },
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        // メールは送信せず、招待リンクをログに出力
        const inviteLink = `${process.env.BETTER_AUTH_URL}/accept-invitation/${data.id}`;

        console.log("==================== 招待メール ====================");
        console.log(`To: ${data.email}`);
        console.log(`Organization: ${data.organization.name}`);
        console.log(
          `Invited by: ${data.inviter.user.name} (${data.inviter.user.email})`,
        );
        console.log(`Role: ${data.role}`);
        console.log(`Invitation Link: ${inviteLink}`);
        console.log("===================================================");
      },
    }),

    /**
     * nextCookies プラグイン: Next.js サーバーアクションでのCookie処理
     *
     * 根拠（公式ドキュメント: https://better-auth.com/docs/integrations/next）:
     * - Next.js のサーバーアクションは Set-Cookie ヘッダーを自動的に処理しない
     * - このプラグインが Set-Cookie ヘッダーを検出し、Cookie を設定
     * - OAuth フローの state パラメータの保存に必須
     *
     * state_mismatch エラーの根本原因:
     * 1. auth.api.signInSocial() が state を Cookie に保存しようとする
     * 2. nextCookies プラグインがないと、Cookie が実際には保存されない
     * 3. Google からのコールバック時、保存された state が見つからない
     * 4. state 検証に失敗 → state_mismatch エラー
     *
     * 重要: このプラグインは必ず plugins 配列の最後に追加すること
     */
    nextCookies(),
  ],
});
