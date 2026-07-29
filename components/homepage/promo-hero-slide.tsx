import Link from "next/link";
import { ArrowRight, BadgeCheck, Droplets, Shield } from "lucide-react";

import { brand } from "@/lib/brand";
import type { HomepageHero } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

function formatHeroPrice(dollars: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}

function FlushIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8h12v8a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V8z" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M12 13c1.2 1.5 1.2 3.5 0 5" />
    </svg>
  );
}

const promoFeatures = [
  {
    key: "warranty",
    label: "20 YEAR WARRANTY",
  },
  {
    key: "water",
    label: "WATER EFFICIENT",
  },
  {
    key: "flush",
    label: "POWERFUL FLUSH",
  },
  {
    key: "quality",
    label: "QUALITY GUARANTEED",
  },
] as const;

function PromoFeatureIcon({ featureKey }: { featureKey: string }) {
  if (featureKey === "warranty") {
    return (
      <span className="relative inline-flex">
        <Shield className="size-7 text-tangaroa md:size-8" />
        <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-[8px] font-bold text-tangaroa">
          20
        </span>
      </span>
    );
  }

  if (featureKey === "water") {
    return <Droplets className="size-7 text-tangaroa md:size-8" />;
  }

  if (featureKey === "flush") {
    return <FlushIcon className="size-7 text-tangaroa md:size-8" />;
  }

  return <BadgeCheck className="size-7 text-tangaroa md:size-8" />;
}

export function PromoHeroSlide({
  slide,
  className,
}: {
  slide: HomepageHero;
  className?: string;
}) {
  const hasPricing =
    slide.compare_at_price != null && slide.price != null;

  return (
    <div
      className={cn(
        "relative flex min-h-[480px] items-center md:min-h-[560px]",
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:from-white/92 md:via-white/75 md:to-transparent"
        aria-hidden="true"
      />

      <div className="site-shell relative w-full py-10 md:py-14">
        <div className="max-w-xl space-y-5 md:space-y-6">
          {slide.badge ? (
            <p className="inline-flex rounded-full bg-warm-stone-600 px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-white uppercase">
              {slide.badge}
            </p>
          ) : null}

          <div className="space-y-1 md:space-y-2">
            {slide.brand_name ? (
              <p className="font-heading text-4xl leading-none text-tangaroa md:text-5xl">
                {slide.brand_name}
              </p>
            ) : null}
            <h2 className="font-heading text-2xl leading-tight text-tangaroa md:text-3xl">
              {slide.headline}
            </h2>
          </div>

          {slide.subheadline ? (
            <p className="max-w-md text-base text-inkjet md:text-lg">
              {slide.subheadline}
            </p>
          ) : null}

          {hasPricing ? (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-slate-grey line-through">
                  WAS {formatHeroPrice(slide.compare_at_price!)}
                </span>
                <span className="h-4 w-px bg-slate-grey/40" aria-hidden="true" />
                <span className="font-bold tracking-wide text-tangaroa uppercase">
                  Now only
                </span>
              </div>
              <p className="font-heading text-5xl leading-none text-warm-stone-600 md:text-6xl">
                {formatHeroPrice(slide.price!)}
              </p>
            </div>
          ) : null}

          {slide.cta_href && slide.cta_text ? (
            <Link
              href={slide.cta_href}
              className="inline-flex items-center gap-2 rounded-full bg-tangaroa px-6 py-3 text-sm font-bold tracking-[0.14em] text-white uppercase transition-colors hover:bg-inkjet"
            >
              {slide.cta_text}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}

          <ul className="grid grid-cols-2 gap-x-4 gap-y-5 pt-2 md:flex md:items-start md:gap-8 md:pt-4">
            {promoFeatures.map((feature) => (
              <li
                key={feature.label}
                className="flex flex-col items-center gap-2 text-center md:items-start md:text-left"
              >
                <PromoFeatureIcon featureKey={feature.key} />
                <span className="text-[10px] font-semibold tracking-[0.12em] text-tangaroa uppercase md:text-[11px]">
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <span className="sr-only">
        {slide.brand_name ? `${slide.brand_name} ` : ""}
        {slide.headline}
        {slide.subheadline ? `. ${slide.subheadline}` : ""}
        {hasPricing
          ? `. Was ${formatHeroPrice(slide.compare_at_price!)}, now ${formatHeroPrice(slide.price!)}`
          : ""}
        {slide.cta_text ? `. ${slide.cta_text}` : ""} on {brand.name}
      </span>
    </div>
  );
}
