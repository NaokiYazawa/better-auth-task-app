import { redirect } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getSession } from "@/lib/session";
import { MembersTable } from "./_components/members-table";
import {
  getOrganizationInvitations,
  getOrganizationMembers,
} from "./_libs/queries";

// セッション情報に依存するため、常に動的にレンダリング
// これによりrouter.refresh()が確実に機能する
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await getSession();

  if (!session?.session.activeOrganizationId) {
    redirect("/organizations/new");
  }

  // メンバー一覧と招待一覧を並列で取得
  const [members, invitations] = await Promise.all([
    getOrganizationMembers(session.session.activeOrganizationId),
    getOrganizationInvitations(session.session.activeOrganizationId),
  ]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Members</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <MembersTable members={members} invitations={invitations} />
      </div>
    </>
  );
}
