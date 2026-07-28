import { Headphones, Package, Star, Truck } from "lucide-react";

import { cn } from "@/lib/utils";

const trustItems = [
  {
    icon: Truck,
    label: "Australia wide shipping",
  },
  {
    icon: Star,
    label: "Trusted by Australians",
  },
  {
    icon: Package,
    label: "2000+ products",
  },
  {
    icon: Headphones,
    label: "Expert advice real support",
  },
] as const;

export function HeroTrustBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-b border-tangaroa/80 bg-tangaroa text-white",
        className,
      )}
    >
      <div className="site-shell">
        <div className="grid grid-cols-2 gap-3 py-3 md:grid-cols-4 md:gap-4 md:py-3.5">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center justify-center gap-2 text-center md:gap-3"
              >
                <Icon className="size-4 shrink-0 text-warm-stone md:size-5" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/95 md:text-xs">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
