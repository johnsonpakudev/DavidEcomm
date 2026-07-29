import { CategoryIconGrid } from "@/components/homepage/category-icon-grid";
import { ClearanceBanner } from "@/components/homepage/clearance-banner";
import { CollectionCards } from "@/components/homepage/collection-cards";
import { HeroCarousel } from "@/components/homepage/hero-carousel";
import { HeroTrustBar } from "@/components/homepage/hero-trust-bar";
import { InspirationGrid } from "@/components/homepage/inspiration-grid";
import { NewsletterSignup } from "@/components/homepage/newsletter-signup";
import { ShopWithConfidence } from "@/components/homepage/shop-with-confidence";
import { TrustBar } from "@/components/homepage/trust-bar";
import { ProductCarousel } from "@/components/product/product-carousel";
import {
  getHeroes,
  getInspirationImages,
  getProductCarousels,
} from "@/lib/homepage";
import {
  buildHomepageHeroSlides,
} from "@/lib/homepage/marketing-assets";
import type { ProductCarouselConfig } from "@/lib/homepage/types";
import {
  getActiveCarousels,
  resolveCarouselProducts,
} from "@/lib/homepage/resolve-carousel";
import type { Product } from "@/lib/supabase/types";

export const revalidate = 60;

const CAROUSEL_LAYOUT_ORDER = [
  "featured",
  "best-sellers",
  "new-arrivals",
] as const;

function sortCarouselsForLayout(carousels: ProductCarouselConfig[]) {
  return [...carousels].sort((left, right) => {
    const leftIndex = CAROUSEL_LAYOUT_ORDER.indexOf(left.key);
    const rightIndex = CAROUSEL_LAYOUT_ORDER.indexOf(right.key);
    return leftIndex - rightIndex;
  });
}

function CarouselSection({
  carousel,
  products,
}: {
  carousel: ProductCarouselConfig;
  products: Product[];
}) {
  return (
    <ProductCarousel
      products={products}
      title={carousel.title}
      subtitle={carousel.subtitle ?? undefined}
      viewAllHref={carousel.viewAllHref ?? undefined}
      ctaLabel={carousel.ctaLabel}
      source={`homepage-${carousel.key}`}
    />
  );
}

export default async function HomePage() {
  const [heroes, inspirationImages, carouselConfigs] = await Promise.all([
    getHeroes(),
    getInspirationImages(),
    getProductCarousels(),
  ]);

  const heroSlides = buildHomepageHeroSlides(heroes);

  const activeCarousels = sortCarouselsForLayout(
    getActiveCarousels(carouselConfigs),
  );
  const carouselEntries = await Promise.all(
    activeCarousels.map(async (carousel) => ({
      carousel,
      products: await resolveCarouselProducts(carousel),
    })),
  );
  const carouselByKey = new Map(
    carouselEntries.map((entry) => [entry.carousel.key, entry]),
  );
  const featured = carouselByKey.get("featured");
  const bestSellers = carouselByKey.get("best-sellers");
  const newArrivals = carouselByKey.get("new-arrivals");

  return (
    <>
      <div className="relative">
        <HeroCarousel slides={heroSlides} />
        <HeroTrustBar className="sticky top-[104px] z-30 lg:top-[108px]" />
      </div>
      {featured ? (
        <CarouselSection
          carousel={featured.carousel}
          products={featured.products}
        />
      ) : null}
      <CollectionCards />
      <CategoryIconGrid />
      <ClearanceBanner />
      {bestSellers ? (
        <CarouselSection
          carousel={bestSellers.carousel}
          products={bestSellers.products}
        />
      ) : null}
      {newArrivals ? (
        <CarouselSection
          carousel={newArrivals.carousel}
          products={newArrivals.products}
        />
      ) : null}
      <InspirationGrid
        images={inspirationImages.slice(0, 4)}
        title="Project inspiration"
      />
      <TrustBar />
      <NewsletterSignup />
      <ShopWithConfidence />
    </>
  );
}
