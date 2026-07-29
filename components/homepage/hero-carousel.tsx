"use client";

import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useMemo } from "react";

import { MarketingImage } from "@/components/homepage/marketing-image";
import { PromoHeroSlide } from "@/components/homepage/promo-hero-slide";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { brand } from "@/lib/brand";
import type { HomepageHero } from "@/lib/supabase/types";

function StandardHeroSlide({ slide }: { slide: HomepageHero }) {
  return (
    <div className="relative flex min-h-[480px] items-end md:min-h-[560px] md:items-center">
      <div className="absolute inset-0 bg-tangaroa/55" />
      <div className="site-shell relative flex w-full py-14">
        <div className="max-w-2xl space-y-6">
          <p className="brand-eyebrow">{brand.name}</p>
          <h2 className="font-heading text-4xl leading-tight text-white md:text-6xl">
            {slide.headline}
          </h2>
          {slide.subheadline ? (
            <p className="max-w-xl text-base text-white/85 md:text-lg">
              {slide.subheadline}
            </p>
          ) : null}
          {slide.cta_href && slide.cta_text ? (
            <Link href={slide.cta_href} className="gold-cta-on-dark">
              {slide.cta_text}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function HeroSlideContent({
  slide,
  imageOnly,
}: {
  slide: HomepageHero;
  imageOnly: boolean;
}) {
  if (imageOnly) {
    return null;
  }

  if (slide.layout === "promo") {
    return <PromoHeroSlide slide={slide} />;
  }

  return <StandardHeroSlide slide={slide} />;
}

export function HeroCarousel({
  slides,
  imageOnly = false,
}: {
  slides: HomepageHero[];
  imageOnly?: boolean;
}) {
  const plugins = useMemo(
    () =>
      imageOnly || slides.length <= 1
        ? []
        : [
            Autoplay({
              delay: 6000,
              stopOnInteraction: true,
            }),
          ],
    [imageOnly, slides.length],
  );

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-tangaroa text-white">
      <Carousel
        plugins={plugins}
        opts={{ loop: !imageOnly && slides.length > 1 }}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id}>
              <div className="relative min-h-[480px] md:min-h-[560px]">
                <MarketingImage
                  src={slide.image_url}
                  alt={slide.headline || `${brand.name} homepage hero`}
                  width={1920}
                  height={560}
                  priority={index === 0}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <HeroSlideContent slide={slide} imageOnly={imageOnly} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {!imageOnly && slides.length > 1 ? (
          <>
            <CarouselPrevious className="left-6 border-white/30 bg-white/10 text-white hover:bg-white/20" />
            <CarouselNext className="right-6 border-white/30 bg-white/10 text-white hover:bg-white/20" />
          </>
        ) : null}
      </Carousel>
    </section>
  );
}
