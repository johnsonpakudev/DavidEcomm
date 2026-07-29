import { prepareCmsEnv } from "./prepare-env";

prepareCmsEnv();

async function main() {
  const email = process.env.CMS_ADMIN_EMAIL?.trim() || "admin@bdksupply.com.au";
  const password = process.env.CMS_ADMIN_PASSWORD?.trim();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to reset the Payload admin user");
  }

  if (!password) {
    throw new Error(
      "CMS_ADMIN_PASSWORD is required. Set it in .env and rerun `npm run cms:reset-admin`.",
    );
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "users",
    limit: 100,
    pagination: false,
  });

  for (const user of existing.docs) {
    await payload.delete({
      collection: "users",
      id: user.id,
    });
    console.log(`Removed existing CMS user: ${user.email}`);
  }

  const created = await payload.create({
    collection: "users",
    data: {
      email,
      password,
    },
  });

  await payload.login({
    collection: "users",
    data: { email, password },
  });

  console.log("Payload CMS admin user reset.");
  console.log(`Email: ${created.email}`);
  console.log("Password: (value of CMS_ADMIN_PASSWORD in .env)");
  console.log("Login verified successfully.");
  console.log("Sign in at /cms");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
