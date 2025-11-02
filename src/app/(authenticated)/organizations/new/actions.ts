"use server";

import { headers } from "next/headers";
import { returnValidationErrors } from "next-safe-action";
import { auth } from "@/lib/auth";
import { authActionClient } from "@/lib/safe-action";
import {
  createMember,
  createOrganization,
  getOrganizationBySlug,
} from "./_libs/mutations";
import { organizationFormSchema } from "./_libs/schema";

/**
 * 組織作成アクション
 * - next-safe-action を使用した型安全なサーバーアクション
 * - Expected Errors: スラッグ重複
 * - Uncaught Exceptions: DB エラーなど（handleServerError でキャッチ）
 *
 * フロー:
 * 1. スラッグの重複チェック（Expected Error）
 * 2. 組織の作成
 * 3. 作成者を owner として追加
 * 4. セッションに作成した組織を設定（activeOrganizationId）
 * 5. 成功レスポンスを返す（クライアント側でナビゲーション）
 */
export const createOrganizationAction = authActionClient
  .metadata({ actionName: "createOrganization" })
  .inputSchema(organizationFormSchema)
  .action(async ({ parsedInput: { name, slug, logo }, ctx: { userId } }) => {
    // Expected Error: スラッグの重複チェック
    const existingOrganization = await getOrganizationBySlug(slug);

    if (existingOrganization) {
      return returnValidationErrors(organizationFormSchema, {
        slug: {
          _errors: ["このスラッグは既に使用されています"],
        },
      });
    }

    // 組織IDとメンバーIDを生成
    const organizationId = crypto.randomUUID();
    const memberId = crypto.randomUUID();

    // 組織を作成（Uncaught Exception は handleServerError でキャッチ）
    const organization = await createOrganization({
      id: organizationId,
      name,
      slug,
      logo,
    });

    // 作成者をownerとして追加
    await createMember({
      id: memberId,
      organizationId: organization.id,
      userId,
      role: "owner",
    });

    // セッションに作成した組織を設定
    // Better Auth の公式 API を使用
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {
        organizationId: organization.id,
      },
    });

    /**
     * 成功レスポンスを返す
     *
     * 根拠:
     * 1. redirect() を使用しない（NEXT_REDIRECT エラーを回避）
     * 2. クライアント側で onSuccess コールバックを使用してナビゲーション
     * 3. これにより、Server Action は純粋にデータ操作のみを行う
     * 4. ナビゲーションの制御をクライアント側に委ねることで柔軟性が向上
     */
    return {
      success: true,
      organizationId: organization.id,
      organizationName: organization.name,
    };
  });
