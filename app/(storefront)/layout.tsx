import type { Metadata } from "next";

import "../globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AnalyticsProvider } from "@/lib/analytics/provider";
import { fontSans } from "@/lib/fonts";
import { buildDefaultMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  ...buildDefaultMetadata(),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo/bdk-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/bdk-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-AU"
      className={`${fontSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-base text-tangaroa antialiased">
        <AnalyticsProvider>
          <CartProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-white focus:px-4 focus:py-2"
            >
              Skip to content
            </a>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </CartProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
