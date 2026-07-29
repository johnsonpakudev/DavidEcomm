import { prepareCmsEnv } from "./prepare-env";

prepareCmsEnv();

async function main() {
  const email = process.env.CMS_ADMIN_EMAIL?.trim() || "admin@bdksupply.com.au";
  const password = process.env.CMS_ADMIN_PASSWORD?.trim();

  if (!password) {
    throw new Error("CMS_ADMIN_PASSWORD is required");
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  const users = await payload.find({
    collection: "users",
    limit: 10,
    pagination: false,
  });

  console.log(
    "Users in database:",
    users.docs.map((user) => ({ id: user.id, email: user.email })),
  );

  try {
    const result = await payload.login({
      collection: "users",
      data: { email, password },
    });
    console.log("Login OK for:", result.user.email);
  } catch (error) {
    console.error("Login failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }

  process.exit(process.exitCode ?? 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
