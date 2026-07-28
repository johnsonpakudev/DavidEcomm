"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { brand } from "@/lib/brand";
import type { HomepageHero } from "@/lib/supabase/types";

export function HeroCarousel({
  slides,
  imageOnly = false,
}: {
  slides: HomepageHero[];
  imageOnly?: boolean;
}) {
  const plugins = useMemo(
    () =>
      imageOnly
        ? []
        : [
            Autoplay({
              delay: 6000,
              stopOnInteraction: true,
            }),
          ],
    [imageOnly],
  );

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-tangaroa text-white">
      <Carousel
        plugins={plugins}
        opts={{ loop: !imageOnly }}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id}>
              <div
                className={
                  imageOnly
                    ? "relative aspect-[16/7] w-full overflow-hidden sm:aspect-[16/6]"
                    : "relative min-h-[560px]"
                }
              >
                <Image
                  src={slide.image_url}
                  alt={slide.headline || `${brand.name} homepage hero`}
                  width={1920}
                  height={imageOnly ? 900 : 560}
                  priority={index === 0}
                  sizes="100vw"
                  className={
                    imageOnly
                      ? "h-full w-full object-cover object-top"
                      : "absolute inset-0 h-full w-full object-cover"
                  }
                />
                {!imageOnly ? (
                  <>
                    <div className="absolute inset-0 bg-tangaroa/55" />
                    <div className="site-shell relative flex min-h-[560px] items-end py-14 md:items-center">
                      <div className="max-w-2xl space-y-6">
                        <p className="brand-eyebrow">{brand.name}</p>
                        <h1 className="font-heading text-4xl leading-tight md:text-6xl">
                          {slide.headline}
                        </h1>
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
                  </>
                ) : null}
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
