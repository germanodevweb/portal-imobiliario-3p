"use client";

import Image from "next/image";
import {
  cloudinaryImageLoader,
  isCloudinaryImageUrl,
} from "@/lib/cloudinary/next-image-loader";

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

export function PropertyPhoto({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
  unoptimized,
  loading,
}: PropertyPhotoProps) {
  const loader = isCloudinaryImageUrl(src) ? cloudinaryImageLoader : undefined;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        loader={loader}
        sizes={sizes}
        priority={priority}
        className={className}
        unoptimized={unoptimized}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1}
      height={height ?? 1}
      loader={loader}
      sizes={sizes}
      priority={priority}
      loading={loading}
      className={className}
      unoptimized={unoptimized}
    />
  );
}
