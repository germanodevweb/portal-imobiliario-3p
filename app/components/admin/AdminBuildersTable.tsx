"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteBuilderAction } from "@/lib/admin/builder-actions";
import type {
  AdminBuilderListItem,
  AdminBuilderPropertySummary,
} from "@/lib/admin/builder-queries";
import { formatPropertyPriceBrl } from "@/lib/utils/property-price";

type Props = {
  builders: AdminBuilderListItem[];
  /** Quando true, exibe mensagem de busca vazia em vez de "nenhuma cadastrada" */
  isFiltered?: boolean;
};

function BuilderPropertyStatusBadges({ property }: { property: AdminBuilderPropertySummary }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          property.published
            ? "bg-green-100 text-green-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {property.published ? "Publicado" : "Arquivado"}
      </span>
      {property.isLaunch ? (
        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
          Lançamento
        </span>
      ) : null}
      {property.isFeatured ? (
        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
          Destaque
        </span>
      ) : null}
      {property.isOpportunity ? (
        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
          Oportunidade
        </span>
      ) : null}
    </div>
  );
}

function BuilderPropertyRow({ property }: { property: AdminBuilderPropertySummary }) {
  return (
    <li className="border-b border-zinc-100 last:border-b-0">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-zinc-900">{property.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600">
            <span className="font-medium tabular-nums text-zinc-800">
              {formatPropertyPriceBrl(property.price)}
            </span>
            <BuilderPropertyStatusBadges property={property} />
          </div>
        </div>
        <Link
          href={`/admin/imoveis/${property.id}/editar`}
          className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-md border border-green-700 px-3 py-1.5 text-xs font-semibold text-green-800 transition-colors hover:bg-green-50"
        >
          Editar
        </Link>
      </div>
    </li>
  );
}

export function AdminBuildersTable({ builders, isFiltered = false }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Excluir a construtora "${name}"? Só é permitido se nenhum imóvel estiver vinculado.`
    );
    if (!confirmed) return;

    setError(null);
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteBuilderAction(id);
      setDeletingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const totalLinkedProperties = builders.reduce((acc, b) => acc + b.propertyCount, 0);

  if (builders.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600">
        {isFiltered
          ? "Nenhuma construtora encontrada para esta busca."
          : 'Nenhuma construtora cadastrada ainda. Clique em "Nova construtora" para adicionar.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
        <span className="text-2xl font-bold text-zinc-900">{totalLinkedProperties}</span>
        <span className="ml-2 text-sm text-zinc-500">
          {totalLinkedProperties === 1
            ? "imóvel vinculado no total"
            : "imóveis vinculados no total"}
        </span>
      </div>

      {builders.map((builder) => (
        <section
          key={builder.id}
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
        >
          <header className="border-b border-zinc-100 bg-zinc-50 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">
                  {builder.name}
                </h2>
                <p className="mt-1 font-mono text-xs text-zinc-500">
                  Slug: {builder.slug}
                </p>
                <dl className="mt-3 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Responsável
                    </dt>
                    <dd>{builder.contactName ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Telefone
                    </dt>
                    <dd>{builder.contactPhone ?? "—"}</dd>
                  </div>
                  {builder.contactEmail ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        E-mail
                      </dt>
                      <dd>{builder.contactEmail}</dd>
                    </div>
                  ) : null}
                </dl>
                <p className="mt-3 text-sm text-zinc-700">
                  Total:{" "}
                  <span className="font-semibold tabular-nums">{builder.propertyCount}</span>{" "}
                  {builder.propertyCount === 1 ? "imóvel" : "imóveis"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/construtoras/${builder.id}/editar`}
                  className="inline-flex min-h-[40px] items-center rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Editar construtora
                </Link>
                <button
                  type="button"
                  disabled={pending && deletingId === builder.id}
                  onClick={() => handleDelete(builder.id, builder.name)}
                  className="inline-flex min-h-[40px] items-center rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {pending && deletingId === builder.id ? "Excluindo…" : "Excluir"}
                </button>
              </div>
            </div>
          </header>

          {builder.properties.length > 0 ? (
            <ul className="divide-y divide-zinc-100">
              {builder.properties.map((property) => (
                <BuilderPropertyRow key={property.id} property={property} />
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-zinc-500 sm:px-5">
              Nenhum imóvel vinculado a esta construtora.
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
