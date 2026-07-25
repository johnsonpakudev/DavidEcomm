import Image from "next/image";
import Link from "next/link";

import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const brandLogoAssets = {
  dark: "/logo/bdk-logo-dark.png",
  light: "/logo/bdk-logo-light.png",
  icon: "/logo/bdk-icon-512.png",
} as const;

interface BrandLogoProps {
  variant?: keyof typeof brandLogoAssets;
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

const logoDimensions = {
  dark: { width: 220, height: 118 },
  light: { width: 253, height: 136 },
  icon: { width: 36, height: 36 },
} as const;

export function BrandLogo({
  variant = "dark",
  href = "/",
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const dimensions = logoDimensions[variant];
  const image = (
    <Image
      src={brandLogoAssets[variant]}
      alt={`${brand.name} — ${brand.tagline}`}
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      className={cn("h-auto w-auto max-h-12 object-contain", imageClassName)}
    />
  );

  if (!href) {
    return <div className={className}>{image}</div>;
  }

  return (
    <Link href={href} className={cn("inline-flex shrink-0 items-center", className)}>
      {image}
    </Link>
  );
}
