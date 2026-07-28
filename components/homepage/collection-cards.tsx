import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MarketingImage } from "@/components/homepage/marketing-image";
import { HOMEPAGE_COLLECTION_SECTIONS } from "@/lib/homepage/marketing-assets";

export function CollectionCards() {
  return (
    <section className="section-space">
      <div className="site-shell space-y-10">
        {HOMEPAGE_COLLECTION_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-5">
            <h2 className="font-heading text-2xl text-tangaroa md:text-3xl">
              {section.title}
            </h2>
            <div
              className={
                section.cards.length === 1
                  ? "grid max-w-xl gap-6"
                  : "grid gap-6 md:grid-cols-2"
              }
            >
              {section.cards.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group relative block min-h-[360px] overflow-hidden rounded-md md:min-h-[420px]"
                >
                  <MarketingImage
                    src={collection.imageUrl}
                    alt={collection.name}
                    fill
                    sizes={
                      section.cards.length === 1
                        ? "(min-width: 768px) 576px, 100vw"
                        : "(min-width: 768px) 50vw, 100vw"
                    }
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-tangaroa/20" />
                  <div className="absolute inset-x-5 bottom-5 rounded-md border-t-2 border-warm-stone-600 bg-white p-5 shadow-lg md:inset-x-6 md:bottom-6 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-tangaroa">
                        {collection.name}
                      </p>
                      <span className="shrink-0 text-sm font-semibold tracking-[0.08em] text-warm-stone-600">
                        {collection.priceTier}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-grey">
                      {collection.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-tangaroa transition-colors group-hover:text-warm-stone-600">
                      {collection.ctaText}
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
