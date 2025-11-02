import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

/**
 * 組織が必要なページのレイアウト
 *
 * セキュリティ検証:
 * 1. ユーザー認証の確認
 * 2. activeOrganizationId の検証（ユーザーが実際にその組織に属しているか）
 * 3. 無効な場合の自動修正（別の組織に切り替え、または組織作成ページへ）
 *
 * 根拠:
 * - Better Auth の listOrganizations() は、ユーザーが属している組織のみを返す
 * - activeOrganizationId がその中に存在しない場合、削除された可能性が高い
 * - 自動修正により、ユーザー体験を損なわずにセキュリティを確保
 */
export default async function WithOrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  // サーバー側で組織リストを取得（ユーザーが属している組織のみ）
  const organizationsData = await auth.api.listOrganizations({
    headers: headersList,
  });

  const activeOrgId = session.session.activeOrganizationId;

  // activeOrganizationId の検証と自動修正
  if (activeOrgId) {
    // ユーザーが実際にその組織に属しているか確認
    const hasAccess = organizationsData.some((org) => org.id === activeOrgId);

    if (!hasAccess) {
      // アクセス権がない場合（削除された、または不正な値）
      if (organizationsData.length > 0) {
        // 別の組織に自動切り替え（最初の組織を選択）
        await auth.api.setActiveOrganization({
          headers: headersList,
          body: {
            organizationId: organizationsData[0].id,
          },
        });

        // 現在のパスにリダイレクト（セッション更新を反映）
        redirect("/tasks");
      } else {
        // 組織がない場合、activeOrganizationId をクリア
        await auth.api.setActiveOrganization({
          headers: headersList,
          body: {
            organizationId: null,
          },
        });

        // 組織作成ページへ
        redirect("/organizations/new");
      }
    }
  } else {
    // activeOrganizationId がない場合
    if (organizationsData.length > 0) {
      // 組織があれば自動設定
      await auth.api.setActiveOrganization({
        headers: headersList,
        body: {
          organizationId: organizationsData[0].id,
        },
      });
      redirect("/tasks");
    } else {
      // 組織がない場合、組織作成ページへ
      redirect("/organizations/new");
    }
  }

  // シリアライズ可能なデータのみを準備（logo文字列のみ）
  const organizations = organizationsData.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo || "building-2", // 文字列のみを渡す（デフォルト値を提供）
  }));

  // ユーザー情報を準備
  const user = {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image || "/avatars/default.jpg",
  };

  return (
    <SidebarProvider>
      <AppSidebar
        organizations={organizations}
        user={user}
        activeOrganizationId={activeOrgId}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
