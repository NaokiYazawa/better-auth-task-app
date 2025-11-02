"use server";

import { signOut } from "@/lib/session";

export async function signOutAction() {
  await signOut();
}
