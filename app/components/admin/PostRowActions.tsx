"use client";

import {
  useState,
  useTransition,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import Link from "next/link";
import { deletePostAction, togglePostPublishAction } from "@/lib/admin/blog-actions";

const MENU_WIDTH_PX = 192;

type Props = {
  postId: string;
  title: string;
  slug: string;
  published: boolean;
};

export function PostRowActions({ postId, title, slug, published }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      const el = buttonRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      let left = r.right - MENU_WIDTH_PX;
      const top = r.bottom + 4;
      const pad = 8;
      const maxLeft = window.innerWidth - MENU_WIDTH_PX - pad;
      left = Math.min(Math.max(pad, left), maxLeft);
      setMenuPos({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir o artigo "${title}"?`)) {
      startTransition(() => {
        deletePostAction(postId);
      });
    }
  };

  const handleTogglePublish = () => {
    startTransition(() => {
      togglePostPublishAction(postId, published);
    });
  };

  const menuContent = (
    <>
      <div
        className="fixed inset-0 z-[100] bg-transparent"
        aria-hidden
        onClick={() => setIsOpen(false)}
      />
      <div
        role="menu"
        className="fixed z-[110] w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-zinc-200"
        style={{ top: menuPos.top, left: menuPos.left }}
      >
        <div className="border-b border-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-500">
          Ações
        </div>

        <Link
          href={`/admin/blog/${postId}/editar`}
          role="menuitem"
          className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          onClick={() => setIsOpen(false)}
        >
          <Edit className="h-4 w-4 text-zinc-400" aria-hidden />
          Editar
        </Link>

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            handleTogglePublish();
            setIsOpen(false);
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
        >
          {published ? (
            <>
              <EyeOff className="h-4 w-4 text-zinc-400" aria-hidden />
              Despublicar
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 text-zinc-400" aria-hidden />
              Publicar
            </>
          )}
        </button>

        {published && (
          <a
            href={`/blog/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            onClick={() => setIsOpen(false)}
          >
            <ExternalLink className="h-4 w-4 text-zinc-400" aria-hidden />
            Ver no site
          </a>
        )}

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            handleDelete();
            setIsOpen(false);
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 text-red-500" aria-hidden />
          Excluir
        </button>
      </div>
    </>
  );

  return (
    <div className="relative flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        disabled={isPending}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-50"
      >
        <span className="sr-only">Ações</span>
        <MoreHorizontal className="h-5 w-5" aria-hidden />
      </button>

      {mounted && isOpen && typeof document !== "undefined"
        ? createPortal(menuContent, document.body)
        : null}
    </div>
  );
}
