import { getUserOrganizationMemberships } from "@/db/queries";

/**
 * 組織に関するビジネスロジック関数
 *
 * データベースクエリの結果を加工・変換する関数を定義します。
 * 純粋なデータベースクエリは src/db/queries.ts に配置してください。
 */

/**
 * ユーザーの最新の組織IDを取得
 *
 * ユーザーが複数の組織に所属している場合、最後に参加した組織のIDを返します。
 * 組織に所属していない場合は null を返します。
 *
 * @param userId - ユーザーID
 * @returns 最新の組織ID、または所属していない場合は null
 */
export async function getUserLatestOrganizationId(
  userId: string,
): Promise<string | null> {
  const memberships = await getUserOrganizationMemberships(userId);

  if (memberships.length === 0) {
    return null;
  }

  return memberships[0]?.organizationId ?? null;
}

/**
 * ユーザーが組織に所属しているかチェック
 *
 * @param userId - ユーザーID
 * @returns 所属している場合は true、所属していない場合は false
 */
export async function hasUserOrganizations(userId: string): Promise<boolean> {
  const memberships = await getUserOrganizationMemberships(userId);
  return memberships.length > 0;
}
