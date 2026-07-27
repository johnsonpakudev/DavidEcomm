import { cookies } from "next/headers";

import { isAdminEnabled } from "@/lib/config/features";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isValidAdminSessionToken,
  timingSafeEqualStrings,
} from "@/lib/admin/session-token";

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return false;
  }

  return timingSafeEqualStrings(password, expected);
}

export async function isAdminAuthenticated() {
  if (!isAdminEnabled()) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return isValidAdminSessionToken(token);
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
