import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { InvitationConfirmationWrapper } from "./_components/invitation-confirmation-wrapper";
import { getInvitationWithDetails } from "./_libs/queries";

interface AcceptInvitationPageProps {
  params: Promise<{ invitationId: string }>;
}

export default async function AcceptInvitationPage({
  params,
}: AcceptInvitationPageProps) {
  const { invitationId } = await params;

  const session = await getSession();
  if (!session) {
    notFound();
  }

  const invitationData = await getInvitationWithDetails(invitationId);

  if (!invitationData) {
    notFound();
  }
  if (invitationData.invitation.email !== session.user.email) {
    notFound();
  }
  if (invitationData.invitation.expiresAt < new Date()) {
    notFound();
  }
  if (invitationData.invitation.status !== "pending") {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <InvitationConfirmationWrapper
          invitationId={invitationId}
          organizationName={invitationData.organizationName}
          inviterName={invitationData.inviterName}
        />
      </main>
    </div>
  );
}
