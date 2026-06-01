"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AdminBuilderListItem } from "@/lib/admin/builder-queries";
import { AdminBuildersTable } from "@/app/components/admin/AdminBuildersTable";

type Props = {
  builders: AdminBuilderListItem[];
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function matchesSearch(builder: AdminBuilderListItem, query: string): boolean {
  const q = normalize(query).trim();
  if (!q) return true;

  const fields = [
    builder.name,
    builder.slug,
    builder.contactName ?? "",
    builder.contactPhone ?? "",
    builder.contactEmail ?? "",
    ...builder.properties.map((p) => p.title),
  ];

  return fields.some((field) => normalize(String(field)).includes(q));
}

/**
 * Lista de construtoras com busca em tempo real.
 * Client Component — filtra os dados recebidos via props.
 */
export function AdminBuildersSearch({ builders }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return builders.filter((builder) => matchesSearch(builder, query));
  }, [builders, query]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar construtoras…"
            title="Buscar por nome, slug ou imóvel vinculado"
            className="min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 sm:text-sm"
            aria-label="Buscar construtoras"
          />
        </div>
        {query ? (
          <p className="text-sm text-zinc-200">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          </p>
        ) : null}
      </div>

      <AdminBuildersTable builders={filtered} isFiltered={query.length > 0} />
    </div>
  );
}
