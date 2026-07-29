import { Client } from "pg";

import {
  getDatabaseSsl,
  resolveDatabaseUrl,
} from "@/lib/db/resolve-database-url";
import { loadEnvFile } from "../load-env";

loadEnvFile();

const PUBLIC_PAYLOAD_ONLY_TABLES = [
  "homepage_product_carousels_product_slugs",
  "homepage_product_carousels",
  "homepage_category_shortcuts",
  "homepage_inspiration",
  "homepage",
  "payload_preferences_rels",
  "payload_preferences",
  "payload_locked_documents_rels",
  "payload_locked_documents",
  "payload_kv",
  "payload_migrations",
  "users_sessions",
  "users",
  "media",
];

const PUBLIC_PAYLOAD_ENUMS = [
  "enum_homepage_category_shortcuts_icon_key",
  "enum_homepage_product_carousels_key",
  "enum_homepage_product_carousels_selection_mode",
  "enum_homepage_product_carousels_sort",
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const resolvedUrl = resolveDatabaseUrl(databaseUrl);
  const client = new Client({
    connectionString: resolvedUrl,
    ssl: getDatabaseSsl(resolvedUrl),
  });

  await client.connect();

  try {
    for (const table of PUBLIC_PAYLOAD_ONLY_TABLES) {
      await client.query(`DROP TABLE IF EXISTS public."${table}" CASCADE`);
      console.log(`Dropped public.${table} if it existed`);
    }

    for (const enumName of PUBLIC_PAYLOAD_ENUMS) {
      await client.query(`DROP TYPE IF EXISTS public."${enumName}" CASCADE`);
      console.log(`Dropped public.${enumName} if it existed`);
    }

    await client.query(`DROP SCHEMA IF EXISTS payload CASCADE`);
    console.log("Dropped payload schema if it existed");
  } finally {
    await client.end();
  }

  console.log("Payload artifact cleanup complete (Phase 1 homepage tables preserved)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
