import {
  getDatabaseSsl,
  resolveDatabaseUrl,
} from "@/lib/db/resolve-database-url";
import { loadEnvFile } from "../load-env";

loadEnvFile();

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolveDatabaseUrl(process.env.DATABASE_URL);

  if (getDatabaseSsl(process.env.DATABASE_URL)) {
    process.env.PGSSLMODE = "require";
  }
}

process.env.PAYLOAD_DB_PUSH = "true";
process.env.CI = "true";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to push the Payload schema");
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");

  await getPayload({ config });
  console.log("Payload schema pushed to database");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
