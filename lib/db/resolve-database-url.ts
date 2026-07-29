export function resolveDatabaseUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);

    if (url.hostname.startsWith("db.") && url.hostname.endsWith(".supabase.co")) {
      const projectRef = url.hostname.slice("db.".length, -".supabase.co".length);
      url.username = `postgres.${projectRef}`;
      url.hostname = "aws-0-ap-northeast-1.pooler.supabase.com";
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
}

export function getDatabaseSsl(rawUrl: string | undefined) {
  if (!rawUrl?.includes("supabase")) {
    return undefined;
  }

  return { rejectUnauthorized: false } as const;
}
