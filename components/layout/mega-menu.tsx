"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { MegaMenuVisualCard } from "@/components/layout/mega-menu-visual-card";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  buildMegaMenuVisualChildrenIndex,
  getMegaMenuVisualChildren,
  MEGA_MENU_PROMO_LINKS,
  selectMegaMenuChildSlug,
} from "@/lib/navigation/mega-menu";
import type { Category, NavigationPillar } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

function activateChild(
  pillarSlug: string,
  childSlug: string,
  setActiveChildren: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
  setActiveChildren((current) => selectMegaMenuChildSlug(current, pillarSlug, childSlug));
}

function MegaMenuPromoLinks() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-saltwater pt-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-grey">
        Popular
      </span>
      {MEGA_MENU_PROMO_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          prefetch
          className="text-xs font-semibold uppercase tracking-[0.12em] text-tangaroa hover:text-warm-stone-600"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function MegaMenu({
  pillars,
  categories,
}: {
  pillars: NavigationPillar[];
  categories: Category[];
}) {
  const [activeChildren, setActiveChildren] = useState<Record<string, string>>({});

  const visualChildrenIndex = useMemo(
    () => buildMegaMenuVisualChildrenIndex(categories),
    [categories],
  );

  return (
    <NavigationMenu
      viewport
      className="hidden w-full max-w-none flex-1 justify-start lg:flex"
      viewportClassName="max-w-7xl"
      viewportWrapperClassName="left-1/2 w-screen -translate-x-1/2"
    >
      <NavigationMenuList className="w-full justify-start gap-8 py-1">
        {pillars.map((pillar) => {
          const selectedChild =
            pillar.children.find(
              (child) => child.slug === activeChildren[pillar.slug],
            ) ?? pillar.children[0];
          const cards = selectedChild
            ? getMegaMenuVisualChildren(selectedChild, visualChildrenIndex)
            : [];
          const isFeatured = cards.length === 1;

          return (
            <NavigationMenuItem key={pillar.slug}>
              <NavigationMenuTrigger className="h-10 rounded-none bg-transparent px-0 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-transparent hover:text-warm-stone focus:bg-transparent focus:text-warm-stone data-open:bg-transparent data-open:text-warm-stone">
                {pillar.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="left-0 mt-0 w-full rounded-none border-0 bg-transparent p-0 shadow-none">
                <div className="site-shell px-0 py-0">
                  <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)]">
                    <nav
                      aria-label={`${pillar.label} categories`}
                      className="border-b border-saltwater bg-saltwater-50 p-5 md:border-r md:border-b-0"
                    >
                      <Link
                        href={`/categories/${pillar.category.slug}`}
                        prefetch
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-grey hover:text-inkjet"
                      >
                        All {pillar.label}
                      </Link>
                      <ul className="mt-4 space-y-1">
                        {pillar.children.map((child) => {
                          const isActive = selectedChild?.id === child.id;

                          return (
                            <li key={child.id}>
                              <Link
                                href={`/categories/${child.slug}`}
                                prefetch
                                onMouseEnter={() =>
                                  activateChild(pillar.slug, child.slug, setActiveChildren)
                                }
                                onFocus={() =>
                                  activateChild(pillar.slug, child.slug, setActiveChildren)
                                }
                                className={cn(
                                  "block rounded-sm border-l-2 border-transparent px-3 py-2 text-sm text-slate-grey transition-colors hover:bg-white hover:text-tangaroa",
                                  isActive &&
                                    "border-warm-stone-600 bg-white font-semibold text-tangaroa",
                                )}
                              >
                                {child.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>

                    <div className="p-5 md:p-6">
                      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-grey">
                            Shop {pillar.label}
                          </p>
                          <h3 className="mt-1 font-heading text-2xl text-tangaroa md:text-3xl">
                            {selectedChild?.name ?? pillar.label}
                          </h3>
                        </div>
                        {selectedChild ? (
                          <Link
                            href={`/categories/${selectedChild.slug}`}
                            prefetch
                            className="text-sm font-semibold uppercase tracking-[0.14em] text-tangaroa hover:text-inkjet"
                          >
                            View all {selectedChild.name}
                          </Link>
                        ) : null}
                      </div>

                      <div
                        className={cn(
                          "grid gap-4",
                          isFeatured
                            ? "grid-cols-1 sm:max-w-md"
                            : "grid-cols-2 xl:grid-cols-4",
                        )}
                      >
                        {cards.map((card) => (
                          <MegaMenuVisualCard
                            key={card.id}
                            category={card}
                            featured={isFeatured}
                          />
                        ))}
                      </div>

                      <MegaMenuPromoLinks />
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
