export function isCheckoutEnabled() {
  return (
    process.env.ENABLE_CHECKOUT === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_CHECKOUT === "true"
  );
}

export function isCmsEnabled() {
  return process.env.ENABLE_CMS === "true";
}

export function isAdminEnabled() {
  return process.env.ENABLE_ADMIN === "true";
}
