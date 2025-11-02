import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { members } from "./schema";

export async function getUserOrganizationMemberships(userId: string) {
  return await db.query.members.findMany({
    where: (members, { eq }) => eq(members.userId, userId),
    orderBy: (members, { desc }) => [desc(members.createdAt)],
  });
}

export async function isUserMemberOfOrganization(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const [member] = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.userId, userId),
        eq(members.organizationId, organizationId),
      ),
    )
    .limit(1);

  return !!member;
}
