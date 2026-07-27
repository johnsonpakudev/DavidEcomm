import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import config from "@payload-config";
import { isCmsEnabled } from "@/lib/config/features";
import {
  mapHomepageGlobal,
  type PayloadHomepageGlobal,
} from "@/lib/homepage/mapper";
import type { MappedHomepage } from "@/lib/homepage/types";

async function fetchHomepageFromPayload(): Promise<MappedHomepage | null> {
  const payload = await getPayload({ config });
  const global = await payload.findGlobal({
    slug: "homepage",
    depth: 1,
  });

  return mapHomepageGlobal(global as PayloadHomepageGlobal);
}

export const getCachedHomepage = unstable_cache(
  async () => fetchHomepageFromPayload(),
  ["homepage-cms"],
  {
    tags: ["homepage"],
    revalidate: 60,
  },
);

export async function getHomepageFromCms(): Promise<MappedHomepage | null> {
  if (!isCmsEnabled() || !process.env.DATABASE_URL) {
    return null;
  }

  try {
    return await getCachedHomepage();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[cms] Failed to load homepage from Payload", error);
    }

    return null;
  }
}
