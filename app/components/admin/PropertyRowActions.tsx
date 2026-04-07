"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { Share2 } from "lucide-react";
import {
  archivePropertyAction,
  publishPropertyAction,
  deletePropertyAction,
} from "@/lib/admin/actions";

type PropertyRowActionsProps = {
  propertyId: string;
  slug: string;
  title: string;
  published: boolean;
};

const DELETE_CONFIRM_MESSAGE =
  "Tem certeza que deseja excluir este imóvel permanentemente? Esta ação não pode ser desfeita.";

/** Base: aparência de botão, toque ≥44px, foco visível */
const btn =
  "inline-flex w-full min-h-[44px] select-none items-center justify-center rounded-lg border px-2 py-2 text-center text-xs font-semibold shadow-sm transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 sm:min-h-[42px] sm:px-3 sm:text-sm";

const btnEdit =
  `${btn} border-green-700 bg-green-700 text-white hover:bg-green-800 focus-visible:ring-green-600`;
const btnArchive =
  `${btn} border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 focus-visible:ring-amber-500`;
const btnPublish =
  `${btn} border-green-600 bg-green-50 text-green-900 hover:bg-green-100 focus-visible:ring-green-600`;
const btnDelete =
  `${btn} border-red-300 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-500`;
const btnShare =
  `${btn} border-sky-500 bg-sky-50 px-1 text-sky-900 hover:bg-sky-100 focus-visible:ring-sky-500 sm:px-2`;

/**
 * Ações por linha da listagem administrativa.
 * Grade 2×2 no mobile; a partir de sm, uma linha com os quatro botões (cards e tabela).
 */
export function PropertyRowActions({
  propertyId,
  slug,
  title,
  published,
}: PropertyRowActionsProps) {
  const deleteFormRef = useRef<HTMLFormElement>(null);

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    if (window.confirm(DELETE_CONFIRM_MESSAGE)) {
      deleteFormRef.current?.requestSubmit();
    }
  }

  const handleShare = useCallback(async () => {
    const path = `/imoveis/${encodeURIComponent(slug)}`;
    const url = new URL(path, window.location.origin).href;
    const text = published
      ? `Confira: ${title}`
      : `${title} — link público (publique o imóvel para a página abrir no site)`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      window.alert("Link do imóvel copiado para a área de transferência.");
    } catch {
      window.prompt("Copie o link do imóvel:", url);
    }
  }, [slug, title, published]);

  return (
    <div
      className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2"
      role="group"
      aria-label="Ações do imóvel"
    >
      <Link href={`/admin/imoveis/${propertyId}/editar`} className={btnEdit}>
        Editar
      </Link>

      {published ? (
        <form
          action={async (formData) => {
            await archivePropertyAction(formData);
          }}
          className="contents"
        >
          <input type="hidden" name="propertyId" value={propertyId} readOnly />
          <button type="submit" className={btnArchive}>
            Arquivar
          </button>
        </form>
      ) : (
        <form
          action={async (formData) => {
            await publishPropertyAction(formData);
          }}
          className="contents"
        >
          <input type="hidden" name="propertyId" value={propertyId} readOnly />
          <button type="submit" className={btnPublish}>
            Publicar
          </button>
        </form>
      )}

      <form
        ref={deleteFormRef}
        action={async (formData) => {
          await deletePropertyAction(formData);
        }}
        className="contents"
      >
        <input type="hidden" name="propertyId" value={propertyId} readOnly />
        <button
          type="button"
          onClick={handleDeleteClick}
          className={btnDelete}
          title={`Excluir ${title}`}
        >
          Excluir
        </button>
      </form>

      <button
        type="button"
        onClick={() => void handleShare()}
        className={btnShare}
        aria-label="Compartilhar imóvel"
        title={
          published
            ? "Compartilhar link público do imóvel"
            : "Copiar link público (publique para a página ficar disponível)"
        }
      >
        <Share2 className="mx-auto h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
        <span className="sr-only">Compartilhar</span>
      </button>
    </div>
  );
}
