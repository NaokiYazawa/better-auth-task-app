import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

export const getSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

export const signOut = cache(async () => {
  await auth.api.signOut({
    headers: await headers(),
  });
});
