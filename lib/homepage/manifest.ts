import { readFileSync } from "node:fs";
import { join } from "node:path";

import { useJsonCatalog } from "@/lib/catalog/source";
import type { CategoryIconKey } from "@/lib/homepage/icon-keys";
import type {
  HomepageCollection,
  HomepageHero,
  HomepagePromo,
  InspirationImage,
} from "@/lib/supabase/types";

export interface CategoryShortcut {
  slug: string;
  iconKey: CategoryIconKey;
}

export interface HomepageManifest {
  heroes: HomepageHero[];
  promos: HomepagePromo[];
  collections: HomepageCollection[];
  inspiration: InspirationImage[];
  categoryShortcuts: CategoryShortcut[];
}

const MANIFEST_PATH = join(process.cwd(), "public/data/catalog/homepage.json");

let manifestCache: HomepageManifest | null | undefined;

export function getHomepageManifest(): HomepageManifest | null {
  if (!useJsonCatalog()) {
    return null;
  }

  if (manifestCache !== undefined) {
    return manifestCache;
  }

  try {
    const content = readFileSync(MANIFEST_PATH, "utf8");
    manifestCache = JSON.parse(content) as HomepageManifest;
    return manifestCache;
  } catch {
    manifestCache = null;
    return null;
  }
}

export function clearHomepageManifestCache(): void {
  manifestCache = undefined;
}
