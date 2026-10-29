"use client";

import Image from "next/image";
import { isCloudinaryImageUrl } from "@/lib/cloudinary/next-image-loader";

type PropertyPhotoProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  unoptimized?: boolean;
  loading?: "lazy" | "eager";
};

/**
 * Fotos de imóvel: URL final fixa (Cloudinary ou proxy legado), sem srcset do next/image.
 */
export function PropertyPhoto({
  src,
  alt,
  fill,
  width,
  height,
  priority,
  className,
  loading,
}: PropertyPhotoProps) {
  const cloudinaryDirect = isCloudinaryImageUrl(src);
  const legacyProxy = src.startsWith("/api/public/property-image");
  const skipOptimizer = cloudinaryDirect || legacyProxy;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        unoptimized={skipOptimizer}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1}
      height={height ?? 1}
      priority={priority}
      loading={loading}
      className={className}
      unoptimized={skipOptimizer}
    />
  );
}
