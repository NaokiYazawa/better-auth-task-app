"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { OrganizationFormFields } from "@/app/(authenticated)/organizations/new/_components/organization-form";
import { useOrganizationForm } from "@/app/(authenticated)/organizations/new/_hooks/use-organization-form";
import { switchOrganizationAction } from "@/app/(with-organization)/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  logoComponent: React.ElementType;
};

interface OrganizationSwitcherProps {
  organizations: Organization[];
  activeOrganizationId: string;
}

export function OrganizationSwitcher({
  organizations,
  activeOrganizationId,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const activeOrganization = React.useMemo(() => {
    return (
      organizations.find((org) => org.id === activeOrganizationId) ||
      organizations[0] ||
      null
    );
  }, [activeOrganizationId, organizations]);

  const { form, handleSubmitWithAction, isSubmitting } = useOrganizationForm(
    {
      name: "",
      slug: "",
      logo: "building-2",
    },
    {
      onSuccess: async () => {
        setIsDialogOpen(false);
        form.reset();
        router.refresh();
      },
    },
  );

  // 組織切り替えハンドラー（完全にサーバー側で処理）
  const handleOrganizationChange = async (organizationId: string) => {
    try {
      // Server Actionでサーバー側のセッション更新とキャッシュ無効化を実行
      const result = await switchOrganizationAction(organizationId);

      if (!result.success) {
        throw new Error(result.error || "組織の切り替えに失敗しました");
      }

      // ユーザーフィードバック
      const selectedOrg = organizations.find(
        (org) => org.id === organizationId,
      );
      if (selectedOrg) {
        toast.success("組織を切り替えました", {
          description: selectedOrg.name,
        });
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to switch organization:", error);
      toast.error("組織の切り替えに失敗しました");
    }
  };

  const handleAddOrganizationClick = () => {
    setIsDialogOpen(true);
  };

  if (!activeOrganization) {
    return null;
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <activeOrganization.logoComponent className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeOrganization.name}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((organization, index) => (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() => handleOrganizationChange(organization.id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <organization.logoComponent className="size-3.5 shrink-0" />
                  </div>
                  {organization.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onSelect={handleAddOrganizationClick}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>組織を作成</DialogTitle>
            <DialogDescription>
              新しい組織の情報を入力してください。組織名からスラッグが自動生成されます。
            </DialogDescription>
          </DialogHeader>
          <OrganizationFormFields
            form={form}
            onSubmit={handleSubmitWithAction}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
