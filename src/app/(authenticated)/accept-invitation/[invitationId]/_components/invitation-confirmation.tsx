"use client";

import { CheckCircle2, Loader2, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InvitationConfirmationProps {
  invitationId: string;
  organizationName?: string;
  inviterName?: string;
  onAccept?: (invitationId: string) => Promise<void>;
  onDecline?: (invitationId: string) => Promise<void>;
}

export function InvitationConfirmation({
  invitationId,
  organizationName = "組織",
  inviterName,
  onAccept,
  onDecline,
}: InvitationConfirmationProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [status, setStatus] = useState<"pending" | "accepted" | "declined">(
    "pending",
  );

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      if (onAccept) {
        await onAccept(invitationId);
      }
      setStatus("accepted");
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      if (onDecline) {
        await onDecline(invitationId);
      }
      setStatus("declined");
    } catch (error) {
      console.error("Failed to decline invitation:", error);
    } finally {
      setIsDeclining(false);
    }
  };

  if (status === "accepted") {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">招待を承認しました</CardTitle>
          <CardDescription className="text-base">
            {organizationName}への参加が完了しました
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === "declined") {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <XCircle className="h-10 w-10 text-gray-600 dark:text-gray-400" />
          </div>
          <CardTitle className="text-2xl">招待を拒否しました</CardTitle>
          <CardDescription className="text-base">
            {organizationName}への招待を辞退しました
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl">組織への招待</CardTitle>
        <CardDescription className="text-base">
          以下の組織に招待されています
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">組織名</p>
            <p className="text-lg font-semibold">{organizationName}</p>
          </div>

          {inviterName && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                招待者
              </p>
              <p className="text-base font-medium">{inviterName}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm text-amber-900 dark:text-amber-200">
            この組織に参加すると、組織のメンバーと協力してタスクを管理できるようになります。
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col-reverse sm:flex-row gap-3">
        <Button
          variant="outline"
          className="w-full sm:flex-1"
          onClick={handleDecline}
          disabled={isDeclining || isAccepting}
        >
          {isDeclining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              処理中...
            </>
          ) : (
            <>
              <XCircle className="mr-2 h-4 w-4" />
              拒否する
            </>
          )}
        </Button>
        <Button
          className="w-full sm:flex-1"
          onClick={handleAccept}
          disabled={isAccepting || isDeclining}
        >
          {isAccepting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              処理中...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              承認する
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
