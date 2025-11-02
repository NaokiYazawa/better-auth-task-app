import { Suspense } from "react";
import { SignInForm } from "./_components/sign-in-form";

/**
 * サインインページ
 *
 * Suspense でラップする理由:
 * - SignInForm で useSearchParams() を使用しているため必須
 * - Next.js 公式ドキュメント: "Any Client Component that uses useSearchParams()
 *   should be wrapped in a <Suspense/> boundary."
 *   https://nextjs.org/docs/app/api-reference/functions/use-search-params
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
