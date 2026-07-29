import { prepareCmsEnv } from "./prepare-env";

prepareCmsEnv();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run CMS migrations");
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  if (typeof payload.db.migrate === "function") {
    await payload.db.migrate();
    console.log("Payload migrations applied");
  } else {
    console.log("Payload database initialized (schema push/migrate adapter ready)");
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
