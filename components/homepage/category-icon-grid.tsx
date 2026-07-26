import Link from "next/link";
import {
  Bath,
  Boxes,
  Droplets,
  DoorOpen,
  Grip,
  House,
  ScanSearch,
  Shield,
  Sparkles,
  Waves,
  Wrench,
} from "lucide-react";

import { brand } from "@/lib/brand";
import { getCachedCategories } from "@/lib/categories";
import { SectionHeading } from "@/components/product/section-heading";
import { getCategoryShortcuts } from "@/lib/homepage";

const iconMap = {
  vanities: Bath,
  toilets: Shield,
  basins: Droplets,
  tapware: Waves,
  showers: Sparkles,
  "mirrors-cabinets": ScanSearch,
  accessories: Grip,
  "door-handles": DoorOpen,
  "kitchen-sinks": House,
  "laundry-tubs": Boxes,
  "cabinet-handles": Wrench,
} as const;

export async function CategoryIconGrid() {
  const [categories, shortcuts] = await Promise.all([
    getCachedCategories(),
    getCategoryShortcuts(),
  ]);

  const items = shortcuts
    .map((shortcut) => {
      const category = categories.find((entry) => entry.slug === shortcut.slug);

      if (!category) {
        return null;
      }

      return {
        category,
        iconKey: shortcut.iconKey,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section className="section-space bg-saltwater-50">
      <div className="site-shell">
        <SectionHeading
          title="Shop by category"
          subtitle={`Explore the most-searched categories across the ${brand.name} catalog.`}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-11">
          {items.map((item) => {
            const Icon =
              iconMap[item.iconKey as keyof typeof iconMap] ?? Bath;

            return (
              <Link
                key={item.category.id}
                href={`/categories/${item.category.slug}`}
                className="group flex flex-col items-center gap-2 rounded-md border border-saltwater bg-white px-2 py-3 text-center transition-colors hover:border-warm-stone"
              >
                <div className="flex size-11 items-center justify-center rounded-md border border-saltwater text-inkjet transition-colors group-hover:border-warm-stone group-hover:text-warm-stone-600 sm:size-12">
                  <Icon className="size-5 sm:size-6" />
                </div>
                <span className="text-xs leading-tight font-medium text-tangaroa">{item.category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
