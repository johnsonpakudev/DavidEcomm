/**
 * Edge-safe admin session helpers (Web Crypto only).
 * Used by middleware — do not import Node built-ins here.
 */
export const ADMIN_SESSION_COOKIE = "bdk_admin_session";

export function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.PAYLOAD_SECRET ?? "";
}

export async function createAdminSessionToken() {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or PAYLOAD_SECRET must be configured");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode("bdk-admin"),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function timingSafeEqualStrings(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function isValidAdminSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  try {
    const expected = await createAdminSessionToken();
    return timingSafeEqualStrings(token, expected);
  } catch {
    return false;
  }
}
