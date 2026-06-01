"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCityAction } from "@/lib/admin/city-actions";
import type { AdminCityListItem } from "@/lib/admin/city-queries";

type Props = {
  cities: AdminCityListItem[];
};

export function AdminCitiesTable({ cities }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Excluir a cidade "${name}"? Só é permitido se nenhum imóvel estiver vinculado.`
    );
    if (!confirmed) return;

    setError(null);
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCityAction(id);
      setDeletingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (cities.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600">
        Nenhuma cidade cadastrada ainda. Clique em &quot;Nova cidade&quot; para adicionar ou
        execute o script de consolidação.
      </div>
    );
  }

  const grouped = cities.reduce<Map<string, AdminCityListItem[]>>((acc, city) => {
    const key = city.state;
    const list = acc.get(key) ?? [];
    list.push(city);
    acc.set(key, list);
    return acc;
  }, new Map());

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {Array.from(grouped.entries()).map(([stateName, stateCities]) => (
        <section
          key={stateName}
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
        >
          <header className="border-b border-zinc-100 bg-zinc-50 px-4 py-3 sm:px-5">
            <h2 className="text-base font-semibold text-zinc-900">{stateName}</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {stateCities.length}{" "}
              {stateCities.length === 1 ? "cidade" : "cidades"}
            </p>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-5">Cidade</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Slug (URL)</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Imóveis</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {stateCities.map((city) => (
                  <tr key={city.id} className="hover:bg-zinc-50/70">
                    <td className="px-4 py-3 font-medium text-zinc-900 sm:px-5">
                      {city.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600 sm:px-5">
                      /cidade/{city.slug}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 sm:px-5">
                      {city.propertyCount}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/cidades/${city.id}/editar`}
                          className="inline-flex min-h-[40px] items-center rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          disabled={pending && deletingId === city.id}
                          onClick={() => handleDelete(city.id, city.name)}
                          className="inline-flex min-h-[40px] items-center rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {pending && deletingId === city.id ? "Excluindo…" : "Excluir"}
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
