"use client";

import { Frame, PieChart } from "lucide-react";
import * as React from "react";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getLogoIcon } from "@/lib/logo-icons";

// 静的なプロジェクトデータ
const items = [
  {
    name: "Tasks",
    url: "/tasks",
    icon: Frame,
  },
  {
    name: "Members",
    url: "/members",
    icon: PieChart,
  },
];

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string; // 文字列として受け取る
};

type User = {
  name: string;
  email: string;
  avatar: string;
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  organizations: Organization[];
  user: User;
  activeOrganizationId: string;
}

export function AppSidebar({
  organizations,
  user,
  activeOrganizationId,
  ...props
}: AppSidebarProps) {
  // Client側でロゴ文字列をコンポーネントに変換
  const organizationsWithIcons = React.useMemo(
    () =>
      organizations.map((org) => ({
        ...org,
        logoComponent: getLogoIcon(org.logo),
      })),
    [organizations],
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher
          organizations={organizationsWithIcons}
          activeOrganizationId={activeOrganizationId}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
