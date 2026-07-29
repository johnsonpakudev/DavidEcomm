import type { Metadata } from "next";

import "../globals.css";
import { fontSans } from "@/lib/fonts";
import { isAdminEnabled } from "@/lib/config/features";

export const metadata: Metadata = {
  title: "Admin | BDK Supply",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminEnabled()) {
    return (
      <html lang="en-AU" className={`${fontSans.variable} h-full antialiased`}>
        <body className="min-h-full bg-white font-sans text-base text-tangaroa antialiased">
          <div className="site-shell py-16">
            <p className="text-slate-grey">Admin is not enabled.</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en-AU" className={`${fontSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-sans text-base text-tangaroa antialiased">
        {children}
      </body>
    </html>
  );
}
