"use client";

import { useEffect, useState } from "react";

const DESKTOP_BREAKPOINT = 768;

interface VideoHeroBackgroundProps {
  videoSrc: string;
  posterSrc?: string;
  overlayClassName?: string;
}

/**
 * Vídeo de fundo premium para hero.
 * - Desktop: exibe vídeo (autoplay, muted, loop)
 * - Mobile: não carrega vídeo, usa gradiente estático (economia de dados e performance)
 * - preload="none" evita carregamento imediato e impacto no LCP
 */
export function VideoHeroBackground({
  videoSrc,
  posterSrc,
  overlayClassName = "bg-black/60",
}: VideoHeroBackgroundProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const handler = () => setIsDesktop(mq.matches);
    handler(); // executa na montagem
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      {/* Camada de fundo: vídeo (desktop) ou gradiente (mobile) */}
      {isDesktop ? (
        <video
          className="absolute inset-0 z-0 size-full object-cover object-center"
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
        />
      ) : (
        <div
          className="absolute inset-0 z-0 bg-linear-to-b from-zinc-900 via-zinc-800 to-zinc-900"
          aria-hidden
        />
      )}

      {/* Overlay escuro para contraste do texto */}
      <div
        className={`absolute inset-0 z-1 ${overlayClassName}`}
        aria-hidden
      />
    </>
  );
}
