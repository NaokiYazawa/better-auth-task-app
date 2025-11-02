import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { getSession } from "@/lib/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <>
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <LogoutButton />

          <div className="text-sm text-muted-foreground">
            {session.user.email}
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
