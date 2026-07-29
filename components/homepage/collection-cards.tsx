import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MarketingImage } from "@/components/homepage/marketing-image";
import { HOMEPAGE_COLLECTION_SECTION } from "@/lib/homepage/marketing-assets";

export function CollectionCards() {
  const { title, subtitle, cards } = HOMEPAGE_COLLECTION_SECTION;

  return (
    <section className="section-space">
      <div className="site-shell space-y-10">
        <div className="space-y-4">
          <span
            className="block h-[3px] w-10 bg-warm-stone-600"
            aria-hidden="true"
          />
          <h2 className="font-heading text-2xl font-bold tracking-[0.12em] text-tangaroa uppercase md:text-3xl">
            {title}
          </h2>
          <p className="max-w-3xl text-sm text-slate-grey md:text-base">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative block min-h-[380px] overflow-hidden rounded-md md:min-h-[440px]"
            >
              <MarketingImage
                src={collection.imageUrl}
                alt={collection.name}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-sm bg-white p-5 shadow-md md:inset-x-5 md:bottom-5 md:p-6">
                <p className="text-sm font-bold tracking-[0.14em] text-tangaroa uppercase md:text-base">
                  {collection.name}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-grey">
                  {collection.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.12em] text-tangaroa uppercase transition-colors group-hover:text-warm-stone-600">
                  {collection.ctaText}
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
