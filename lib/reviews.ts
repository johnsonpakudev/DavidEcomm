export const PRODUCT_REVIEW_SOURCES = [
  "native",
  "import",
  "google",
  "trustpilot",
  "yotpo",
  "feefo",
  "productreview",
  "manual",
] as const;

export type ProductReviewSource = (typeof PRODUCT_REVIEW_SOURCES)[number];

export const PRODUCT_REVIEW_SOURCE_LABELS: Record<ProductReviewSource, string> = {
  native: "BDK Supply",
  import: "Imported",
  google: "Google",
  trustpilot: "Trustpilot",
  yotpo: "Yotpo",
  feefo: "Feefo",
  productreview: "ProductReview.com.au",
  manual: "BDK Supply",
};

export function getReviewSourceLabel(source: ProductReviewSource) {
  return PRODUCT_REVIEW_SOURCE_LABELS[source];
}
