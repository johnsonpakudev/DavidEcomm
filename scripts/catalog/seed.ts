import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SQL_DIR = "supabase";

function discoverSqlFiles(): string[] {
  if (!existsSync(SQL_DIR)) {
    return [join(SQL_DIR, "seed_catalog.sql")];
  }

  const entries = readdirSync(SQL_DIR);
  const files: string[] = [];

  if (entries.includes("seed_catalog.sql")) {
    files.push(join(SQL_DIR, "seed_catalog.sql"));
  }

  const partFiles = entries
    .filter((filename) => /^seed_catalog_part\d+\.sql$/.test(filename))
    .sort((left, right) => {
      const leftPart = Number.parseInt(left.match(/\d+/)?.[0] ?? "0", 10);
      const rightPart = Number.parseInt(right.match(/\d+/)?.[0] ?? "0", 10);
      return leftPart - rightPart;
    })
    .map((filename) => join(SQL_DIR, filename));

  files.push(...partFiles);

  if (files.length === 0) {
    files.push(join(SQL_DIR, "seed_catalog.sql"));
  }

  return files;
}

function printManualInstructions(): void {
  const files = discoverSqlFiles();

  console.log("DATABASE_URL is not set. To seed the catalog manually:");
  console.log("");
  console.log("1. Run `npm run catalog:build` to generate SQL files.");
  console.log("2. Open the Supabase SQL editor for your project.");
  console.log("3. Run the generated file(s) in order:");
  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log("");
  console.log("Or set DATABASE_URL in .env and rerun `npm run catalog:seed`.");
}

async function seedWithPg(databaseUrl: string): Promise<void> {
  const { Client } = await import("pg");
  const files = discoverSqlFiles();
  const client = new Client({ connectionString: databaseUrl });

  await client.connect();

  try {
    for (const file of files) {
      const sql = readFileSync(file, "utf8");
      console.log(`Applying ${file}...`);
      await client.query(sql);
    }

    console.log("Catalog seed completed.");
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    printManualInstructions();
    return;
  }

  await seedWithPg(databaseUrl);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
