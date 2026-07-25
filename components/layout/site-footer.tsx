import Link from "next/link";
import { Camera, Globe, Mail, MapPin, Phone } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { brand } from "@/lib/brand";
import { getFooterLinks, getSiteConfig } from "@/lib/homepage";

export async function SiteFooter() {
  const [links, siteConfig] = await Promise.all([getFooterLinks(), getSiteConfig()]);
  const grouped = Object.groupBy(links, (link) => link.column_name);

  return (
    <footer className="mt-auto bg-tangaroa text-white">
      <div className="site-shell py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4">
            <BrandLogo variant="light" href="/" />
            <p className="max-w-xs text-sm text-white/70">
              Building and renovation supplies for bathrooms, kitchens, hardware and beautifully finished spaces.
            </p>
            <div className="flex items-center gap-3">
              {siteConfig.social_links.facebook ? (
                <a
                  href={siteConfig.social_links.facebook}
                  className="rounded-full border border-white/20 p-2 text-white/80 hover:text-warm-stone"
                >
                  <Globe className="size-4" />
                  <span className="sr-only">Facebook</span>
                </a>
              ) : null}
              {siteConfig.social_links.instagram ? (
                <a
                  href={siteConfig.social_links.instagram}
                  className="rounded-full border border-white/20 p-2 text-white/80 hover:text-warm-stone"
                >
                  <Camera className="size-4" />
                  <span className="sr-only">Instagram</span>
                </a>
              ) : null}
            </div>
          </div>

          {["Shop", "Customer Care", "Explore"].map((column) => (
            <div key={column} className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-warm-stone">
                {column}
              </h2>
              <ul className="space-y-3 text-sm text-white/75">
                {(grouped[column] ?? []).map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-warm-stone">
              Contact
            </h2>
            <div className="space-y-3 text-sm text-white/75">
              {siteConfig.phone ? (
                <a href={`tel:${siteConfig.phone}`} className="flex items-start gap-3 hover:text-white">
                  <Phone className="mt-0.5 size-4 shrink-0" />
                  <span>{siteConfig.phone}</span>
                </a>
              ) : null}
              {siteConfig.email ? (
                <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-3 hover:text-white">
                  <Mail className="mt-0.5 size-4 shrink-0" />
                  <span>{siteConfig.email}</span>
                </a>
              ) : null}
              {siteConfig.address ? (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>{siteConfig.address}</span>
                </div>
              ) : null}
              {siteConfig.trading_hours ? <p>{siteConfig.trading_hours}</p> : null}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-end">
          <div className="flex flex-wrap items-center gap-4">
            <span>{new Date().getFullYear()} {brand.name}</span>
            <Link href="#" className="hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
