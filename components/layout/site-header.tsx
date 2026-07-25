import Link from "next/link";
import { Menu, User } from "lucide-react";

import { CartNavLink } from "@/components/cart/cart-nav-link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { HeaderSearch } from "@/components/layout/header-search";
import { MegaMenu } from "@/components/layout/mega-menu";
import { TopBar } from "@/components/layout/top-bar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { brand } from "@/lib/brand";
import { getCachedCategories } from "@/lib/categories";
import { getNavigationTree } from "@/lib/navigation";

export async function SiteHeader() {
  const [categories, pillars] = await Promise.all([
    getCachedCategories(),
    getNavigationTree(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-saltwater bg-white/95 backdrop-blur">
      <TopBar />
      <div className="site-shell flex items-center gap-3 py-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-0">
            <SheetHeader className="border-b border-saltwater">
              <SheetTitle className="sr-only">Browse {brand.name}</SheetTitle>
              <BrandLogo variant="dark" href="/" className="px-1" priority />
              <form action="/search" className="pt-4">
                <label htmlFor="mobile-sheet-search" className="sr-only">
                  Search for products
                </label>
                <Input
                  id="mobile-sheet-search"
                  name="q"
                  placeholder="Search for products..."
                  className="h-11 rounded-full border-saltwater px-4"
                />
              </form>
            </SheetHeader>
            <div className="p-4">
              <Accordion type="single" collapsible>
                {pillars.map((pillar) => (
                  <AccordionItem key={pillar.slug} value={pillar.slug}>
                    <AccordionTrigger className="font-semibold uppercase tracking-[0.16em]">
                      {pillar.label}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                      <Link
                        href={`/categories/${pillar.category.slug}`}
                        className="block text-sm font-semibold text-tangaroa"
                      >
                        All {pillar.label}
                      </Link>
                      <div className="space-y-2">
                        {pillar.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/categories/${child.slug}`}
                            className="block text-sm text-slate-grey"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </SheetContent>
        </Sheet>

        <BrandLogo variant="dark" href="/" className="shrink-0" priority />

        <div className="hidden flex-1 justify-center md:flex">
          <HeaderSearch showMobile={false} />
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <HeaderSearch showDesktop={false} />
          <Button asChild variant="ghost" size="icon" aria-label="Account">
            <Link href="/account">
              <User className="size-5" />
            </Link>
          </Button>
          <CartNavLink />
        </div>
      </div>
      <div className="hidden bg-tangaroa lg:block">
        <div className="site-shell">
          <MegaMenu pillars={pillars} categories={categories} />
        </div>
      </div>
    </header>
  );
}
