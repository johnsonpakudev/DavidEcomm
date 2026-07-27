import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import sharp from "sharp";

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
      connectionString: process.env.DATABASE_URL || "",
    },
    push: process.env.NODE_ENV !== "production",
  }),
  sharp,
});
