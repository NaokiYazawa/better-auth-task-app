"use client";

import { Mail, MoreVertical, UserMinus, UserPlus, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cancelInvitationAction,
  inviteMemberAction,
  removeMemberAction,
  resendInvitationAction,
} from "../actions";
import type {
  OrganizationInvitation,
  OrganizationMember,
} from "../_libs/queries";

type Role = "owner" | "admin" | "member";

interface MembersTableProps {
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
}

const roleLabels: Record<Role, string> = {
  owner: "オーナー",
  admin: "管理者",
  member: "メンバー",
};

const roleColors: Record<Role, string> = {
  owner:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200",
  admin:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200",
  member:
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200",
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function MembersTable({ members, invitations }: MembersTableProps) {
  const router = useRouter();
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [cancelInvitationDialogOpen, setCancelInvitationDialogOpen] =
    useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedInvitationId, setSelectedInvitationId] = useState<
    string | null
  >(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRemoveMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setRemoveMemberDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!selectedMemberId) return;

    setIsSubmitting(true);
    try {
      const result = await removeMemberAction({
        memberId: selectedMemberId,
      });

      if (result?.data?.success) {
        toast.success("メンバーを削除しました");
        setRemoveMemberDialogOpen(false);
        setSelectedMemberId(null);
        router.refresh();
      }
    } catch (error) {
      toast.error("メンバーの削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = (invitationId: string) => {
    setSelectedInvitationId(invitationId);
    setCancelInvitationDialogOpen(true);
  };

  const confirmCancelInvitation = async () => {
    if (!selectedInvitationId) return;

    setIsSubmitting(true);
    try {
      const result = await cancelInvitationAction({
        invitationId: selectedInvitationId,
      });

      if (result?.data?.success) {
        toast.success("招待をキャンセルしました");
        setCancelInvitationDialogOpen(false);
        setSelectedInvitationId(null);
        router.refresh();
      }
    } catch (error) {
      toast.error("招待のキャンセルに失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    setIsSubmitting(true);
    try {
      const result = await resendInvitationAction({
        invitationId,
      });

      if (result?.data?.success) {
        toast.success("招待を再送信しました");
        router.refresh();
      }
    } catch (error) {
      toast.error("招待の再送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;

    setIsSubmitting(true);
    try {
      const result = await inviteMemberAction({
        email: inviteEmail,
        role: inviteRole,
      });

      if (result?.data?.success) {
        toast.success("招待を送信しました");
        setInviteDialogOpen(false);
        setInviteEmail("");
        setInviteRole("member");
        router.refresh();
      }
    } catch (error) {
      toast.error("招待の送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 組織メンバー一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>組織メンバー</CardTitle>
          <CardDescription>
            この組織に属しているユーザーの一覧です
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>メンバー</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>参加日</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {member.user.image && (
                          <AvatarImage
                            src={member.user.image}
                            alt={member.user.name}
                          />
                        )}
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.user.email}
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[member.role as Role]}>
                      {roleLabels[member.role as Role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.createdAt.toString())}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="hover:bg-accent rounded-md p-1 transition-colors">
                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id)}
                          variant="destructive"
                          className="cursor-pointer"
                          disabled={member.role === "owner"}
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          <span>削除</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 招待中ユーザー一覧 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <CardTitle>招待中のユーザー</CardTitle>
              <CardDescription>
                この組織に招待されているユーザーの一覧です
              </CardDescription>
            </div>
            <Button
              onClick={() => setInviteDialogOpen(true)}
              className="sm:shrink-0"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              招待
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>メールアドレス</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>招待者</TableHead>
                <TableHead>招待日</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">
                    {invitation.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        roleColors[(invitation.role as Role) || "member"]
                      }
                    >
                      {roleLabels[(invitation.role as Role) || "member"]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invitation.inviter.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(invitation.expiresAt.toString())}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="hover:bg-accent rounded-md p-1 transition-colors">
                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleResendInvitation(invitation.id)}
                          className="cursor-pointer"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          <span>再送信</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancelInvitation(invitation.id)}
                          variant="destructive"
                          className="cursor-pointer"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          <span>キャンセル</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* メンバー削除確認ダイアログ */}
      <AlertDialog
        open={removeMemberDialogOpen}
        onOpenChange={setRemoveMemberDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>メンバーを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません。このメンバーは組織から削除され、アクセス権限を失います。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 招待キャンセル確認ダイアログ */}
      <AlertDialog
        open={cancelInvitationDialogOpen}
        onOpenChange={setCancelInvitationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>招待をキャンセルしますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この招待はキャンセルされ、招待されたユーザーは組織に参加できなくなります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelInvitation}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              キャンセル
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 招待ダイアログ */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザーを招待</DialogTitle>
            <DialogDescription>
              組織に招待するユーザーのメールアドレスとロールを入力してください。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">メールアドレス</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@gmail.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invite-role">ロール</Label>
              <Select
                value={inviteRole}
                onValueChange={(value: Role) => setInviteRole(value)}
              >
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue placeholder="ロールを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">メンバー</SelectItem>
                  <SelectItem value="admin">管理者</SelectItem>
                  <SelectItem value="owner">オーナー</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInviteDialogOpen(false);
                setInviteEmail("");
                setInviteRole("member");
              }}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || isSubmitting}
            >
              招待を送信
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
