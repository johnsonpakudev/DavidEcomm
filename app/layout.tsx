import type { Metadata } from "next";
import "./globals.css";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${fontSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-base text-tangaroa antialiased">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
