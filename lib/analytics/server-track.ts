import type { AnalyticsEventMap, AnalyticsEventName } from "@/lib/analytics/events";

function analyticsEnabled() {
  return process.env.ANALYTICS_ENABLED === "true";
}

export async function trackServer<TEvent extends AnalyticsEventName>(
  event: TEvent,
  properties: AnalyticsEventMap[TEvent],
) {
  if (!analyticsEnabled()) {
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  if (!apiKey) {
    return;
  }

  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        properties: {
          ...properties,
          $lib: "server",
        },
      }),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Server analytics track failed", error);
    }
  }
}
