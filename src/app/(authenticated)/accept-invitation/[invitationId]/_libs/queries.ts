import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invitations, organizations, users } from "@/db/schema";

export async function getInvitationWithDetails(invitationId: string) {
  const [invitationData] = await db
    .select({
      invitation: invitations,
      organizationName: organizations.name,
      inviterName: users.name,
    })
    .from(invitations)
    .innerJoin(organizations, eq(invitations.organizationId, organizations.id))
    .innerJoin(users, eq(invitations.inviterId, users.id))
    .where(eq(invitations.id, invitationId))
    .limit(1);

  return invitationData;
}

export async function getInvitation(invitationId: string) {
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.id, invitationId))
    .limit(1);

  return invitation;
}

export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user;
}
