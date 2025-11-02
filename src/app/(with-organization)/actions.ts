"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function switchOrganizationAction(organizationId: string) {
  try {
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {
        organizationId,
      },
    });

    return {
      success: true,
      organizationId,
    };
  } catch (error) {
    console.error("Failed to switch organization:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "組織の切り替えに失敗しました",
    };
  }
}
