"use client";

import Image from "next/image";
import { useState } from "react";
import { StepImageProps } from "@/types/shared/general";

function StepImage({ src, alt, className, width, height }: StepImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-contain transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        priority
      />
    </div>
  );
}

export default StepImage;
