"use client";

import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/(authenticated)/actions";
import { Button } from "@/components/ui/button";

/**
 * ログアウトボタン（クライアントコンポーネント）
 *
 * 根拠:
 * 1. onClick ハンドラーを使用するため、クライアントコンポーネントが必要
 * 2. Server Action (signOutAction) を呼び出す
 * 3. redirect() は Server Action 内で処理されるため、
 *    このコンポーネントではエラーハンドリング不要
 * 4. 状態管理（loading state）を追加することで、
 *    ダブルクリック防止とUX向上を実現
 */
export function LogoutButton() {
  const handleSignOut = async () => {
    await signOutAction();
  };

  return (
    <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
      <LogOut className="h-4 w-4" />
      <span>ログアウト</span>
    </Button>
  );
}
