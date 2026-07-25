export function isCheckoutEnabled() {
  return (
    process.env.ENABLE_CHECKOUT === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_CHECKOUT === "true"
  );
}
