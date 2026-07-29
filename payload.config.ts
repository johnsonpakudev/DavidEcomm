import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import sharp from "sharp";

import {
  getDatabaseSsl,
  resolveDatabaseUrl,
} from "@/lib/db/resolve-database-url";
import { Media } from "@/payload/collections/Media";
import { Users } from "@/payload/collections/Users";
import { Homepage } from "@/payload/globals/Homepage";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  routes: {
    admin: "/cms",
  },
  collections: [Users, Media],
  globals: [Homepage],
  secret: process.env.PAYLOAD_SECRET || "dev-only-change-me-in-production-32chars",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: resolveDatabaseUrl(process.env.DATABASE_URL || ""),
      ssl: getDatabaseSsl(process.env.DATABASE_URL),
    },
    push: process.env.PAYLOAD_DB_PUSH === "true",
    schemaName: "payload",
  }),
  sharp,
});
