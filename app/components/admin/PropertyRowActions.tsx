"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  archivePropertyAction,
  publishPropertyAction,
  deletePropertyAction,
} from "@/lib/admin/actions";

type PropertyRowActionsProps = {
  propertyId: string;
  title: string;
  published: boolean;
};

const DELETE_CONFIRM_MESSAGE =
  "Tem certeza que deseja excluir este imóvel permanentemente? Esta ação não pode ser desfeita.";

/**
 * Ações por linha da listagem administrativa.
 * Client Component — necessário para confirmação de exclusão.
 */
export function PropertyRowActions({
  propertyId,
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/imoveis/${propertyId}/editar`}
        className="text-sm font-medium text-green-700 hover:text-green-800"
      >
        Editar
      </Link>

      {published ? (
        <form
          action={async (formData) => {
            await archivePropertyAction(formData);
          }}
          className="inline"
        >
          <input type="hidden" name="propertyId" value={propertyId} readOnly />
          <button
            type="submit"
            className="text-sm text-amber-700 hover:text-amber-800"
          >
            Arquivar
          </button>
        </form>
      ) : (
        <form
          action={async (formData) => {
            await publishPropertyAction(formData);
          }}
          className="inline"
        >
          <input type="hidden" name="propertyId" value={propertyId} readOnly />
          <button
            type="submit"
            className="text-sm font-medium text-green-700 hover:text-green-800"
          >
            Publicar
          </button>
        </form>
      )}

      <form
        ref={deleteFormRef}
        action={async (formData) => {
          await deletePropertyAction(formData);
        }}
        className="inline"
      >
        <input type="hidden" name="propertyId" value={propertyId} readOnly />
        <button
          type="button"
          onClick={handleDeleteClick}
          className="text-sm text-red-600 hover:text-red-700"
          title={`Excluir ${title}`}
        >
          Excluir
        </button>
      </form>
    </div>
  );
}
