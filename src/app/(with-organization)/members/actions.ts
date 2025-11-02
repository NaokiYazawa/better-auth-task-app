"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { invitations, members, organizations, users } from "@/db/schema";
import { orgActionClient } from "@/lib/safe-action";
import {
  cancelInvitationSchema,
  createInvitationSchema,
  removeMemberSchema,
  resendInvitationSchema,
} from "./_libs/schema";

export const inviteMemberAction = orgActionClient
  .metadata({ actionName: "inviteMember" })
  .inputSchema(createInvitationSchema)
  .action(
    async ({
      parsedInput: { email, role },
      ctx: { userId, organizationId },
    }) => {
      // 招待の有効期限を7日後に設定
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const [invitation] = await db
        .insert(invitations)
        .values({
          id: crypto.randomUUID(),
          organizationId,
          email,
          role,
          status: "pending",
          expiresAt,
          inviterId: userId,
        })
        .returning();

      const [orgData] = await db
        .select({
          orgName: organizations.name,
          inviterName: users.name,
          inviterEmail: users.email,
        })
        .from(organizations)
        .innerJoin(users, eq(users.id, userId))
        .where(eq(organizations.id, organizationId))
        .limit(1);

      const inviteLink = `${process.env.BETTER_AUTH_URL}/accept-invitation/${invitation.id}`;

      console.log("==================== 招待メール ====================");
      console.log(`To: ${email}`);
      console.log(`Organization: ${orgData.orgName}`);
      console.log(
        `Invited by: ${orgData.inviterName} (${orgData.inviterEmail})`,
      );
      console.log(`Role: ${role}`);
      console.log(`Invitation Link: ${inviteLink}`);
      console.log("===================================================");

      revalidatePath("/members");

      return {
        success: true,
        email,
        role,
      };
    },
  );

export const cancelInvitationAction = orgActionClient
  .metadata({ actionName: "cancelInvitation" })
  .inputSchema(cancelInvitationSchema)
  .action(async ({ parsedInput: { invitationId } }) => {
    await db
      .update(invitations)
      .set({
        status: "cancelled",
      })
      .where(eq(invitations.id, invitationId));

    revalidatePath("/members");

    return {
      success: true,
      invitationId,
    };
  });

export const resendInvitationAction = orgActionClient
  .metadata({ actionName: "resendInvitation" })
  .inputSchema(resendInvitationSchema)
  .action(async ({ parsedInput: { invitationId } }) => {
    const [invitationData] = await db
      .select({
        invitation: invitations,
        orgName: organizations.name,
        inviterName: users.name,
        inviterEmail: users.email,
      })
      .from(invitations)
      .innerJoin(
        organizations,
        eq(invitations.organizationId, organizations.id),
      )
      .innerJoin(users, eq(invitations.inviterId, users.id))
      .where(eq(invitations.id, invitationId))
      .limit(1);

    if (!invitationData) {
      throw new Error("招待情報が見つかりませんでした");
    }

    const inviteLink = `${process.env.BETTER_AUTH_URL}/accept-invitation/${invitationId}`;

    console.log("==================== 招待メール(再送信) ====================");
    console.log(`To: ${invitationData.invitation.email}`);
    console.log(`Organization: ${invitationData.orgName}`);
    console.log(
      `Invited by: ${invitationData.inviterName} (${invitationData.inviterEmail})`,
    );
    console.log(`Role: ${invitationData.invitation.role}`);
    console.log(`Invitation Link: ${inviteLink}`);
    console.log("=========================================================");

    revalidatePath("/members");

    return {
      success: true,
      invitationId,
      email: invitationData.invitation.email,
    };
  });

export const removeMemberAction = orgActionClient
  .metadata({ actionName: "removeMember" })
  .inputSchema(removeMemberSchema)
  .action(async ({ parsedInput: { memberId } }) => {
    await db.delete(members).where(eq(members.id, memberId));

    revalidatePath("/members");

    return {
      success: true,
      memberId,
    };
  });
