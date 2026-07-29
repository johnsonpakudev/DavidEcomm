import {
  getDatabaseSsl,
  resolveDatabaseUrl,
} from "@/lib/db/resolve-database-url";
import { loadEnvFile } from "../load-env";

export function prepareCmsEnv(): void {
  loadEnvFile();
  process.env.PAYLOAD_DB_PUSH = "false";
  process.env.PAYLOAD_MIGRATE_FORCE = "true";

  if (!process.env.DATABASE_URL) {
    return;
  }

  process.env.DATABASE_URL = resolveDatabaseUrl(process.env.DATABASE_URL);

  if (getDatabaseSsl(process.env.DATABASE_URL)) {
    process.env.PGSSLMODE = "require";
  }
}
