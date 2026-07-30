import { Headphones, Package, Star, Truck } from "lucide-react";

import { cn } from "@/lib/utils";

const trustItems = [
  {
    icon: Truck,
    label: "Australia wide shipping",
    shortLabel: "AU shipping",
  },
  {
    icon: Star,
    label: "Trusted by Australians",
    shortLabel: "Trusted AU",
  },
  {
    icon: Package,
    label: "2000+ products",
    shortLabel: "2000+ products",
  },
  {
    icon: Headphones,
    label: "Expert advice & support",
    shortLabel: "Expert support",
  },
] as const;

export function HeroTrustBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-t border-white/10 bg-tangaroa text-white shadow-[0_8px_24px_-12px_rgba(30,43,59,0.45)]",
        className,
      )}
    >
      <div className="site-shell">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5 py-3 sm:grid-cols-4 sm:gap-2 sm:py-0 sm:h-11 sm:items-center md:gap-4">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <li
                key={item.label}
                className="flex min-w-0 items-center justify-center gap-1.5 sm:gap-1.5 md:gap-2"
              >
                <Icon
                  className="size-4 shrink-0 text-warm-stone sm:size-4"
                  aria-hidden="true"
                />
                <span
                  className="text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-white/95 sm:truncate sm:text-[10px] sm:tracking-[0.1em] md:text-xs md:tracking-[0.12em]"
                  title={item.label}
                >
                  <span className="sm:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
