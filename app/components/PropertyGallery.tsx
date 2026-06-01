"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getWatermarkedImageUrl,
  shouldUseUnoptimizedNextImage,
} from "@/lib/cloudinary/watermark";
import { publicPropertyImageSrc } from "@/lib/utils/public-property-image-src";
import type { PropertyGalleryBadge, PropertyGalleryItem } from "@/lib/utils/property-gallery";
import { PropertyGalleryLightbox } from "@/app/components/PropertyGalleryLightbox";

type PropertyGalleryProps = {
  images: PropertyGalleryItem[];
  badges?: PropertyGalleryBadge[];
};

function resolveInlineImageSrc(url: string): string {
  return publicPropertyImageSrc(getWatermarkedImageUrl(url));
}

export function PropertyGallery({ images, badges = [] }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const count = images.length;
  const safeIndex = count > 0 ? Math.min(currentIndex, count - 1) : 0;
  const current = count > 0 ? images[safeIndex] : null;

  useEffect(() => {
    if (count === 0) return;
    setCurrentIndex((i) => Math.min(i, count - 1));
  }, [count]);

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((i) => (i <= 0 ? count - 1 : i - 1));
  }, [count]);

  const goNext = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((i) => (i >= count - 1 ? 0 : i + 1));
  }, [count]);

  useEffect(() => {
    const el = thumbRefs.current[safeIndex];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [safeIndex]);

  if (!current) return null;

  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100 sm:aspect-video">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Ampliar foto ${safeIndex + 1} de ${count}: ${current.alt}`}
          className="group absolute inset-0 z-[1] cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
        >
          <Image
            key={current.url}
            src={resolveInlineImageSrc(current.url)}
            alt={current.alt}
            fill
            priority={safeIndex === 0}
            unoptimized={shouldUseUnoptimizedNextImage(current.url)}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1152px"
            className="object-cover transition-transform duration-200 group-active:scale-[1.01]"
          />
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
            <ZoomIn className="h-3.5 w-3.5" aria-hidden />
            Ampliar
          </span>
        </button>

        {badges.length > 0 && (
          <div className="pointer-events-none absolute left-4 top-4 z-[2] flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.id}
                className={`pointer-events-none ${b.className}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              aria-label="Imagem anterior"
              className="absolute left-3 top-1/2 z-[2] flex h-11 min-h-11 min-w-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200/80 bg-white/80 text-green-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-green-600 hover:bg-green-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:h-12 sm:min-h-12 sm:min-w-12 sm:w-12"
            >
              <ChevronLeft
                aria-hidden
                className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                strokeWidth={2.25}
              />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              aria-label="Próxima imagem"
              className="absolute right-3 top-1/2 z-[2] flex h-11 min-h-11 min-w-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200/80 bg-white/80 text-green-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-green-600 hover:bg-green-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:h-12 sm:min-h-12 sm:min-w-12 sm:w-12"
            >
              <ChevronRight
                aria-hidden
                className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                strokeWidth={2.25}
              />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Miniaturas da galeria"
        >
          {images.map((img, i) => {
            const active = i === safeIndex;
            return (
              <button
                key={img.url}
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Foto ${i + 1} de ${count}`}
                onClick={() => setCurrentIndex(i)}
                className={`relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-18 sm:w-32 ${
                  active
                    ? "ring-2 ring-green-600 ring-offset-2 ring-offset-white"
                    : "opacity-75 ring-1 ring-zinc-200 hover:opacity-100"
                }`}
              >
                <Image
                  src={publicPropertyImageSrc(getWatermarkedImageUrl(img.url, "compact"))}
                  alt=""
                  width={128}
                  height={72}
                  sizes="(max-width: 640px) 112px, 128px"
                  loading={i === safeIndex ? "eager" : "lazy"}
                  unoptimized={shouldUseUnoptimizedNextImage(img.url)}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      <PropertyGalleryLightbox
        images={images}
        index={safeIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setCurrentIndex}
      />
    </div>
  );
}
