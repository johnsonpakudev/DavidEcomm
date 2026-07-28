import Image from "next/image";
import Link from "next/link";

import { MARKETING_ASSETS } from "@/lib/homepage/marketing-assets";

export function ClearanceBanner() {
  return (
    <section className="section-space">
      <div className="site-shell">
        <Link
          href="/collections/clearance"
          className="group block overflow-hidden rounded-md shadow-sm transition-shadow hover:shadow-md"
        >
          <Image
            src={MARKETING_ASSETS.clearanceBanner}
            alt="On clearance"
            width={1920}
            height={640}
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </Link>
      </div>
    </section>
  );
}
