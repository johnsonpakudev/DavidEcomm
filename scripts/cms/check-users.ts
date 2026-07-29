import { Client } from "pg";

import {
  getDatabaseSsl,
  resolveDatabaseUrl,
} from "@/lib/db/resolve-database-url";
import { prepareCmsEnv } from "./prepare-env";

prepareCmsEnv();

async function main() {
  const client = new Client({
    connectionString: resolveDatabaseUrl(process.env.DATABASE_URL || ""),
    ssl: getDatabaseSsl(process.env.DATABASE_URL),
  });

  await client.connect();
  const result = await client.query(
    `SELECT id, email, login_attempts, lock_until FROM payload.users ORDER BY id`,
  );
  console.log(result.rows);
  await client.end();
}

main().catch(console.error);
