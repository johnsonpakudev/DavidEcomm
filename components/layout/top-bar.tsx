import { Phone } from "lucide-react";

import { getSiteConfig } from "@/lib/homepage";

export async function TopBar() {
  const siteConfig = await getSiteConfig();

  return (
    <div className="bg-tangaroa text-white">
      <div className="site-shell flex min-h-9 flex-col gap-2 py-2 text-xs md:min-h-[36px] md:flex-row md:items-center md:justify-between md:py-0">
        <p className="tracking-[0.12em] uppercase">{siteConfig.promo_text}</p>
        <div className="flex flex-wrap items-center gap-4 text-white/80">
          {siteConfig.phone ? (
            <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center gap-2 hover:text-warm-stone">
              <Phone className="size-3.5" />
              <span>{siteConfig.phone}</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
