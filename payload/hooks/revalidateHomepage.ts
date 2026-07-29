import { revalidatePath, revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

export const revalidateHomepage: GlobalAfterChangeHook = () => {
  try {
    revalidateTag("homepage", "max");
    revalidatePath("/");
  } catch {
    // cms:seed and other standalone scripts run outside the Next.js request context.
  }
};
