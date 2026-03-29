"use client";

import Image from "next/image";
import { useState } from "react";
import { adminImageSrc } from "@/lib/admin/admin-image-src";

type Props = {
  src: string;
  className?: string;
};

/**
 * Miniatura na lista admin.
 * `unoptimized`: evita `/_next/image` — o otimizador faz fetch no servidor e muitas URLs
 * (legado, IP local em dev) retornam 404; sem otimização o browser carrega a URL direto.
 */
export function AdminPropertyThumbnail({ src, className }: Props) {
  const [failed, setFailed] = useState(false);
  const resolved = adminImageSrc(src);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[10px] leading-tight text-zinc-400">
        Sem img
      </div>
    );
  }

  return (
    <Image
      src={resolved}
      alt=""
      fill
      unoptimized
      className={className ?? "object-cover"}
      sizes="64px"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
