"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  Facebook,
  Instagram,
  Linkedin,
  Share2,
  Twitter,
} from "lucide-react";
import { buildWhatsAppShareUrl } from "@/lib/utils/whatsapp-share";
import {
  buildFacebookShareUrl,
  buildLinkedInShareUrl,
  buildTwitterIntentUrl,
} from "@/lib/utils/blog-share";

/** Perfil oficial (mesmo link do rodapé) — usado só como referência na legenda copiada. */
const INSTAGRAM_PROFILE = "https://www.instagram.com/3pinheiros.consultoria/";

type BlogPostShareProps = {
  /** URL absoluta do artigo (canónica) */
  shareUrl: string;
  title: string;
};

export function BlogPostShare({ shareUrl, title }: BlogPostShareProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instagramCopied, setInstagramCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, close]);

  const whatsappHref = buildWhatsAppShareUrl(`${title}\n${shareUrl}`);
  const facebookHref = buildFacebookShareUrl(shareUrl);
  const linkedInHref = buildLinkedInShareUrl(shareUrl);
  const twitterHref = buildTwitterIntentUrl(shareUrl, title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setInstagramCopied(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignorar */
    }
  };

  /** Instagram não tem URL de partilha web; copiamos legenda + link para colar no app. */
  const copyForInstagram = async () => {
    const block = `${title.trim()}\n\n${shareUrl}\n\n@3pinheiros.consultoria\n${INSTAGRAM_PROFILE}`;
    try {
      await navigator.clipboard.writeText(block);
      setCopied(false);
      setInstagramCopied(true);
      window.setTimeout(() => setInstagramCopied(false), 2800);
    } catch {
      /* ignorar */
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title,
        text: title,
        url: shareUrl,
      });
      close();
    } catch {
      /* utilizador cancelou */
    }
  };

  const itemClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-800 transition-colors hover:bg-green-50 hover:text-green-800";

  return (
    <div ref={wrapRef} className="relative mt-10">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="blog-share-menu"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex min-h-[52px] items-center gap-3 rounded-full bg-green-800 px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 ${
          open ? "ring-2 ring-white/40 ring-offset-2 ring-offset-white" : ""
        }`}
      >
        <Share2 className="h-5 w-5 shrink-0" aria-hidden />
        Compartilhar artigo
      </button>

      {open && (
        <div
          id="blog-share-menu"
          role="menu"
          aria-label="Compartilhar em redes sociais"
          className="absolute left-0 top-full z-20 mt-2 w-[min(100%,20rem)] rounded-xl border border-zinc-200 bg-white py-2 shadow-lg"
        >
          {canNativeShare && (
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => void nativeShare()}
            >
              <Share2 className="h-4 w-4 shrink-0 text-green-700" aria-hidden />
              Compartilhar pelo dispositivo
            </button>
          )}

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={itemClass}
            onClick={close}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 fill-green-600"
              aria-hidden
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>

          <a
            href={facebookHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={itemClass}
            onClick={close}
          >
            <Facebook className="h-4 w-4 shrink-0 text-[#1877F2]" aria-hidden />
            Facebook
          </a>

          <button
            type="button"
            role="menuitem"
            className={itemClass}
            aria-label="Copiar texto e link do artigo para colar no Instagram"
            onClick={() => void copyForInstagram()}
          >
            <Instagram className="h-4 w-4 shrink-0 text-[#E4405F]" aria-hidden />
            {instagramCopied
              ? "Copiado! Cole no Instagram"
              : "Instagram"}
          </button>

          <a
            href={linkedInHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={itemClass}
            onClick={close}
          >
            <Linkedin className="h-4 w-4 shrink-0 text-[#0A66C2]" aria-hidden />
            LinkedIn
          </a>

          <a
            href={twitterHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={itemClass}
            onClick={close}
          >
            <Twitter className="h-4 w-4 shrink-0 text-zinc-900" aria-hidden />
            X (Twitter)
          </a>

          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => void copyLink()}
          >
            <Copy className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
            {copied ? "Link copiado!" : "Copiar link"}
          </button>
        </div>
      )}
    </div>
  );
}
