"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  getWatermarkedImageUrl,
  shouldUseUnoptimizedNextImage,
} from "@/lib/cloudinary/watermark";
import { publicPropertyImageSrc } from "@/lib/utils/public-property-image-src";
import type { PropertyGalleryItem } from "@/lib/utils/property-gallery";

type PropertyGalleryLightboxProps = {
  images: PropertyGalleryItem[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

type PanZoom = {
  scale: number;
  x: number;
  y: number;
};

const SWIPE_THRESHOLD_PX = 48;
const MIN_SCALE = 1;
const MAX_SCALE = 3;
const DOUBLE_TAP_MS = 320;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveImageSrc(url: string): string {
  return publicPropertyImageSrc(getWatermarkedImageUrl(url));
}

export function PropertyGalleryLightbox({
  images,
  index,
  open,
  onClose,
  onIndexChange,
}: PropertyGalleryLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [panZoom, setPanZoom] = useState<PanZoom>({ scale: 1, x: 0, y: 0 });
  const swipeStartX = useRef<number | null>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartScale = useRef(1);
  const lastTapAt = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  const count = images.length;
  const safeIndex = count > 0 ? clamp(index, 0, count - 1) : 0;
  const current = count > 0 ? images[safeIndex] : null;

  const panZoomRef = useRef(panZoom);
  panZoomRef.current = panZoom;

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetPanZoom = useCallback(() => {
    setPanZoom({ scale: 1, x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!open) return;
    resetPanZoom();
  }, [open, safeIndex, resetPanZoom]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && panZoomRef.current.scale <= 1) {
        onIndexChange(safeIndex <= 0 ? count - 1 : safeIndex - 1);
      }
      if (event.key === "ArrowRight" && panZoomRef.current.scale <= 1) {
        onIndexChange(safeIndex >= count - 1 ? 0 : safeIndex + 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, onIndexChange, safeIndex, count]);

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    onIndexChange(safeIndex <= 0 ? count - 1 : safeIndex - 1);
  }, [count, onIndexChange, safeIndex]);

  const goNext = useCallback(() => {
    if (count <= 1) return;
    onIndexChange(safeIndex >= count - 1 ? 0 : safeIndex + 1);
  }, [count, onIndexChange, safeIndex]);

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      const [a, b] = [event.touches[0], event.touches[1]];
      pinchStartDistance.current = Math.hypot(
        a.clientX - b.clientX,
        a.clientY - b.clientY
      );
      pinchStartScale.current = panZoom.scale;
      swipeStartX.current = null;
      return;
    }

    if (event.touches.length === 1 && panZoom.scale <= 1) {
      swipeStartX.current = event.touches[0].clientX;
    }
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2 && pinchStartDistance.current != null) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ratio = distance / pinchStartDistance.current;
      const nextScale = clamp(pinchStartScale.current * ratio, MIN_SCALE, MAX_SCALE);
      setPanZoom((prev) => ({
        scale: nextScale,
        x: nextScale <= 1 ? 0 : prev.x,
        y: nextScale <= 1 ? 0 : prev.y,
      }));
    }
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (pinchStartDistance.current != null && event.touches.length < 2) {
      pinchStartDistance.current = null;
      if (panZoomRef.current.scale <= 1.05) resetPanZoom();
      return;
    }

    if (swipeStartX.current == null || panZoomRef.current.scale > 1) {
      swipeStartX.current = null;
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? swipeStartX.current;
    const delta = endX - swipeStartX.current;
    swipeStartX.current = null;

    if (delta <= -SWIPE_THRESHOLD_PX) goNext();
    else if (delta >= SWIPE_THRESHOLD_PX) goPrev();
  };

  const handleDoubleTap = (event: ReactPointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTapAt.current < DOUBLE_TAP_MS) {
      event.preventDefault();
      if (panZoom.scale > 1) {
        resetPanZoom();
      } else {
        setPanZoom({ scale: 2, x: 0, y: 0 });
      }
      lastTapAt.current = 0;
      return;
    }
    lastTapAt.current = now;
  };

  if (!mounted || !open || !current) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria ampliada — foto ${safeIndex + 1} de ${count}`}
      className="fixed inset-0 z-[100] flex flex-col bg-zinc-950/95"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white">
        <p className="text-sm font-medium tabular-nums text-white/90">
          {safeIndex + 1} / {count}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar galeria ampliada"
          className="flex h-11 min-h-11 min-w-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <X className="h-6 w-6" aria-hidden />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handleDoubleTap}
      >
        {count > 1 && panZoom.scale <= 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Imagem anterior"
              className="absolute left-2 top-1/2 z-10 flex h-11 min-h-11 min-w-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:left-4"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Próxima imagem"
              className="absolute right-2 top-1/2 z-10 flex h-11 min-h-11 min-w-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:right-4"
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
          </>
        )}

        <div className="absolute inset-0 flex items-center justify-center px-2 sm:px-6">
          <div
            className="relative h-full w-full max-h-full max-w-full"
            style={{
              transform: `translate3d(${panZoom.x}px, ${panZoom.y}px, 0) scale(${panZoom.scale})`,
              transition: panZoom.scale === 1 ? "transform 0.2s ease-out" : undefined,
            }}
          >
            <Image
              key={current.url}
              src={resolveImageSrc(current.url)}
              alt={current.alt}
              fill
              unoptimized={shouldUseUnoptimizedNextImage(current.url)}
              sizes="100vw"
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <p className="shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-xs text-white/60">
        Deslize para trocar · Toque duplo para ampliar
      </p>
    </div>,
    document.body
  );
}
