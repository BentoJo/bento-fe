import Image from "next/image";

import { cn } from "@/shared/lib/utils";
import logo from "../../public/Logo-light.svg"

interface BrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
  /** When true, only the wordmark is hidden visually (e.g. collapsed states). */
  alt?: string;
}

/**
 * ManeJo brand logo. Renders /logo.svg via next/image.
 */
export function BrandLogo({
  className,
  width = 150,
  height = 37,
  alt = "ManeJo",
}: BrandLogoProps) {
  return (
    <Image
      src={logo}
      alt={alt}
      width={width}
      height={height}
      priority
      className={cn("h-auto w-auto select-none", className)}
    />
  );
}
