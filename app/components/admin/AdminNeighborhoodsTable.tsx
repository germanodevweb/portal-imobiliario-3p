"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteNeighborhoodAction } from "@/lib/admin/neighborhood-actions";
import type { AdminNeighborhoodGroup } from "@/lib/admin/neighborhood-queries";

type Props = {
  groups: AdminNeighborhoodGroup[];
};

export function AdminNeighborhoodsTable({ groups }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Excluir o bairro "${name}"? Só é permitido se nenhum imóvel estiver vinculado.`
    );
    if (!confirmed) return;

    setError(null);
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteNeighborhoodAction(id);
      setDeletingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const total = groups.reduce((acc, g) => acc + g.neighborhoods.length, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600">
        Nenhum bairro cadastrado ainda. Clique em &quot;Novo bairro&quot; para adicionar.
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

      {groups.map((group) => (
        <section
          key={`${group.citySlug}-${group.stateSlug}`}
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
        >
          <header className="border-b border-zinc-100 bg-zinc-50 px-4 py-3 sm:px-5">
            <h2 className="text-base font-semibold text-zinc-900">
              {group.city}
              <span className="ml-2 text-sm font-normal text-zinc-500">{group.state}</span>
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {group.neighborhoods.length}{" "}
              {group.neighborhoods.length === 1 ? "bairro" : "bairros"}
            </p>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-5">Bairro</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Slug (URL)</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Imóveis</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {group.neighborhoods.map((n) => (
                  <tr key={n.id} className="hover:bg-zinc-50/70">
                    <td className="px-4 py-3 font-medium text-zinc-900 sm:px-5">
                      {n.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600 sm:px-5">
                      /bairro/{n.slug}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 sm:px-5">{n.propertyCount}</td>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/bairros/${n.id}/editar`}
                          className="inline-flex min-h-[40px] items-center rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          disabled={pending && deletingId === n.id}
                          onClick={() => handleDelete(n.id, n.name)}
                          className="inline-flex min-h-[40px] items-center rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {pending && deletingId === n.id ? "Excluindo…" : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
