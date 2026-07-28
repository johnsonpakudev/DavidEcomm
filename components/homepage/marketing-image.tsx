import Image from "next/image";

import { cn } from "@/lib/utils";

interface MarketingImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
}

export function MarketingImage({
  src,
  alt,
  className,
  priority = false,
  width,
  height,
  fill = false,
  sizes,
}: MarketingImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      unoptimized
      className={cn(className)}
    />
  );
}
