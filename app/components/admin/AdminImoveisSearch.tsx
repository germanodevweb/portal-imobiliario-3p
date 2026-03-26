"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { AdminPropertyListItem } from "@/lib/admin/queries";
import { AdminImoveisTable } from "@/app/components/admin/AdminImoveisTable";

type Props = {
  properties: AdminPropertyListItem[];
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function matchesSearch(property: AdminPropertyListItem, query: string): boolean {
  const q = normalize(query).trim();
  if (!q) return true;

  const fields = [
    property.title,
    property.slug,
    property.city,
    property.neighborhood ?? "",
    property.price,
  ];

  return fields.some((f) => normalize(String(f)).includes(q));
}

/**
 * Lista de imóveis com busca em tempo real.
 * Client Component — filtra os dados recebidos via props.
 */
export function AdminImoveisSearch({ properties }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return properties.filter((p) => matchesSearch(p, query));
  }, [properties, query]);

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
            placeholder="Buscar por título, slug, cidade, bairro ou preço..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            aria-label="Buscar imóveis"
          />
        </div>
        {query && (
          <p className="text-sm text-zinc-500">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          </p>
        )}
      </div>

      <AdminImoveisTable properties={filtered} isFiltered={query.length > 0} />
    </div>
  );
}
