import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { isAdminEnabled } from "@/lib/config/features";

const COOKIE_NAME = "bdk_admin_session";

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.PAYLOAD_SECRET ?? "";
}

export function createAdminSessionToken() {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or PAYLOAD_SECRET must be configured");
  }

  return createHmac("sha256", secret).update("bdk-admin").digest("hex");
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return false;
  }

  const left = Buffer.from(password);
  const right = Buffer.from(expected);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export async function isAdminAuthenticated() {
  if (!isAdminEnabled()) {
    return false;
  }

  const secret = getSessionSecret();

  if (!secret) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const expected = createAdminSessionToken();

  if (!token) {
    return false;
  }

  const left = Buffer.from(token);
  const right = Buffer.from(expected);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
