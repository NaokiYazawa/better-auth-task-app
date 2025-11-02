import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * 招待ページのカスタム404ページ
 *
 * notFound()が呼び出されたときに表示される
 *
 * 表示されるケース:
 * 1. 招待が存在しない
 * 2. 招待されたメールアドレスと現在のユーザーのメールアドレスが一致しない
 * 3. 招待の有効期限が切れている
 * 4. 招待が既に承認または拒否されている
 *
 * セキュリティ上の理由:
 * - 具体的なエラー理由を表示しない（403ではなく404を使用）
 * - 招待の存在を他のユーザーに知らせない
 * - プライバシーを保護
 */
export default function InvitationNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">招待が見つかりません</CardTitle>
            <CardDescription className="text-base mt-2">
              この招待は存在しないか、既に使用されています。
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                以下の理由が考えられます：
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>招待リンクが正しくない</li>
                <li>招待の有効期限が切れている</li>
                <li>招待が既に承認または拒否されている</li>
                <li>別のアカウントで招待リンクを開いている</li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                招待リンクは招待されたメールアドレスのアカウントでのみ有効です。
                正しいアカウントでサインインしているか確認してください。
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:flex-1" asChild>
              <Link href="/">ホームに戻る</Link>
            </Button>
            <Button className="w-full sm:flex-1" asChild>
              <Link href="/tasks">タスクページへ</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
