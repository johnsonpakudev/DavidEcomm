"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { Category, NavigationPillar } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export function MegaMenu({
  pillars,
  categories,
}: {
  pillars: NavigationPillar[];
  categories: Category[];
}) {
  const [activeChildren, setActiveChildren] = useState<Record<string, string>>({});

  const categoryChildren = useMemo(() => {
    const map = new Map<string, Category[]>();

    for (const category of categories) {
      if (!category.parent_id) {
        continue;
      }

      const existing = map.get(category.parent_id) ?? [];
      existing.push(category);
      map.set(category.parent_id, existing);
    }

    return map;
  }, [categories]);

  return (
    <NavigationMenu viewport={false} className="hidden w-full justify-start lg:flex">
      <NavigationMenuList className="w-full justify-start gap-6">
        {pillars.map((pillar) => {
          const selectedChild =
            pillar.children.find(
              (child) => child.slug === activeChildren[pillar.slug],
            ) ?? pillar.children[0];
          const visualChildren = selectedChild
            ? (categoryChildren
                .get(selectedChild.id)
                ?.sort((left, right) => left.mega_menu_order - right.mega_menu_order)
                .slice(0, 8) ?? [])
            : [];
          const cards = visualChildren.length > 0 ? visualChildren : selectedChild ? [selectedChild] : [];

          return (
            <NavigationMenuItem key={pillar.slug}>
              <NavigationMenuTrigger className="rounded-none bg-transparent px-0 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-transparent hover:text-warm-stone focus:bg-transparent focus:text-warm-stone data-open:bg-transparent data-open:text-warm-stone">
                {pillar.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="left-0 mt-0 w-[min(100vw-2rem,1120px)] rounded-none border border-saltwater bg-white p-0 shadow-2xl">
                <div className="grid min-h-[420px] grid-cols-[280px_1fr]">
                  <div className="border-r border-saltwater bg-saltwater-50 p-6">
                    <div className="mb-6">
                      <Link
                        href={`/categories/${pillar.category.slug}`}
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-grey hover:text-inkjet"
                      >
                        All {pillar.label}
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {pillar.children.map((child) => {
                        const isActive = selectedChild?.id === child.id;

                        return (
                          <Link
                            key={child.id}
                            href={`/categories/${child.slug}`}
                            onMouseEnter={() =>
                              setActiveChildren((current) => ({
                                ...current,
                                [pillar.slug]: child.slug,
                              }))
                            }
                            className={cn(
                              "block rounded-sm px-3 py-2 text-sm text-slate-grey hover:bg-white hover:text-tangaroa",
                              isActive &&
                                "bg-white font-semibold text-tangaroa underline underline-offset-4",
                            )}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-grey">
                          Shop {pillar.label}
                        </p>
                        <h3 className="mt-2 font-heading text-3xl text-tangaroa">
                          {selectedChild?.name ?? pillar.label}
                        </h3>
                      </div>
                      {selectedChild ? (
                        <Link
                          href={`/categories/${selectedChild.slug}`}
                          className="text-sm font-semibold uppercase tracking-[0.14em] text-tangaroa hover:text-inkjet"
                        >
                          View all {selectedChild.name}
                        </Link>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
                      {cards.map((card) => (
                        <Link
                          key={card.id}
                          href={`/categories/${card.slug}`}
                          className="group text-center"
                        >
                          <div className="relative mx-auto flex aspect-square w-28 items-center justify-center overflow-hidden rounded-full bg-saltwater-50">
                            {card.mega_menu_image ? (
                              <Image
                                src={card.mega_menu_image}
                                alt={card.name}
                                fill
                                sizes="112px"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <span className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-grey">
                                {card.name
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map((word) => word.charAt(0))
                                  .join("")}
                              </span>
                            )}
                          </div>
                          <p className="mt-3 line-clamp-2 text-sm font-medium text-tangaroa">
                            {card.name}
                          </p>
                        </Link>
                      ))}
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
