"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { AdminLeadListItem } from "@/lib/admin/queries";
import { AdminLeadsTable } from "@/app/components/admin/AdminLeadsTable";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
} from "@/lib/constants/leads";

type LeadStatus = keyof typeof LEAD_STATUS_LABELS;

type Props = {
  leads: AdminLeadListItem[];
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function matchesSearch(lead: AdminLeadListItem, query: string): boolean {
  const q = normalize(query).trim();
  if (!q) return true;

  const fields = [
    lead.name,
    lead.phone,
    lead.desiredPriceRange ?? "",
  ];

  return fields.some((f) => normalize(String(f)).includes(q));
}

const STATUS_FILTER_OPTIONS: { value: "" | LeadStatus; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "novo", label: LEAD_STATUS_LABELS.novo },
  { value: "em_contato", label: LEAD_STATUS_LABELS.em_contato },
  { value: "qualificado", label: LEAD_STATUS_LABELS.qualificado },
  { value: "vendido", label: LEAD_STATUS_LABELS.vendido },
  { value: "perdido", label: LEAD_STATUS_LABELS.perdido },
];

/**
 * Lista de leads com busca e filtro por status.
 * Client Component — filtra os dados recebidos via props.
 */
export function AdminLeadsSearch({ leads }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | LeadStatus>("");

  const filtered = useMemo(() => {
    let result = leads;
    if (statusFilter) {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (query.trim()) {
      result = result.filter((l) => matchesSearch(l, query));
    }
    return result;
  }, [leads, query, statusFilter]);

  const hasActiveFilter = query.length > 0 || statusFilter !== "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, telefone ou faixa de valor..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            aria-label="Buscar leads"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-500">Status:</span>
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value || "todos"}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? opt.value
                    ? `${LEAD_STATUS_COLORS[opt.value]} ring-1 ring-zinc-300`
                    : "bg-zinc-200 text-zinc-800 ring-1 ring-zinc-400"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {hasActiveFilter && (
        <p className="text-sm text-zinc-500">
          {filtered.length}{" "}
          {filtered.length === 1 ? "resultado" : "resultados"}
        </p>
      )}

      <AdminLeadsTable leads={filtered} isFiltered={hasActiveFilter} />
    </div>
  );
}
