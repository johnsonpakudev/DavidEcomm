import { revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

export const revalidateHomepage: GlobalAfterChangeHook = () => {
  revalidateTag("homepage", "max");
};
