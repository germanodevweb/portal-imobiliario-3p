"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminLeadListItem } from "@/lib/admin/queries";
import { LeadStatusSelect } from "@/app/components/admin/LeadStatusSelect";
import { LeadDeleteButton } from "@/app/components/admin/LeadDeleteButton";
import { getOriginDisplayLabel } from "@/lib/constants/leads";
import { deleteLeadsBulkAction } from "@/lib/admin/lead-actions";
import { formatPhoneForDisplay } from "@/lib/utils/phone";

type Props = {
  leads: AdminLeadListItem[];
  /** Quando true, exibe mensagem de "nenhum resultado" em vez de "nenhum lead cadastrado" */
  isFiltered?: boolean;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Hover em <tr> é pouco confiável no WebKit; o fundo verde vai em cada <td>. */
const LEADS_TD_HOVER =
  "bg-white transition-colors duration-200 group-hover:bg-green-50";

/**
 * Tabela administrativa de leads com seleção múltipla para exclusão em lote.
 */
export function AdminLeadsTable({ leads, isFiltered }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkPending, startBulkTransition] = useTransition();

  const visibleIds = useMemo(() => leads.map((lead) => lead.id), [leads]);

  useEffect(() => {
    const visible = new Set(visibleIds);
    setSelectedIds((current) => current.filter((id) => visible.has(id)));
  }, [visibleIds]);

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.includes(id)) && !allVisibleSelected;

  function toggleOne(leadId: string, checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(leadId) ? current : [...current, leadId];
      }
      return current.filter((id) => id !== leadId);
    });
  }

  function toggleAllVisible(checked: boolean) {
    if (!checked) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id))
      );
      return;
    }
    setSelectedIds((current) => [...new Set([...current, ...visibleIds])]);
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0 || isBulkPending) return;

    const count = selectedIds.length;
    const label = count === 1 ? "1 lead" : `${count} leads`;
    if (
      !window.confirm(
        `Excluir permanentemente ${label} selecionado${count === 1 ? "" : "s"}? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    startBulkTransition(async () => {
      const result = await deleteLeadsBulkAction(selectedIds);
      if (result.ok) {
        setSelectedIds([]);
        router.refresh();
        return;
      }
      window.alert(result.error ?? "Não foi possível excluir os leads.");
    });
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
        <p className="text-zinc-500">
          {isFiltered
            ? "Nenhum lead encontrado para a busca."
            : "Nenhum lead cadastrado ainda."}
        </p>
        {!isFiltered && (
          <p className="mt-2 text-sm text-zinc-500">
            Os leads do site e os cadastrados manualmente aparecerão aqui.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-900">
            {selectedIds.length}{" "}
            {selectedIds.length === 1 ? "lead selecionado" : "leads selecionados"}
          </p>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={isBulkPending}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBulkPending ? "Excluindo…" : "Excluir selecionados"}
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full border-collapse">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th scope="col" className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someVisibleSelected;
                  }}
                  onChange={(event) => toggleAllVisible(event.target.checked)}
                  aria-label="Selecionar todos os leads visíveis"
                  className="size-4 rounded border-zinc-300 text-green-700 focus:ring-green-600/30"
                />
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
              >
                Nome
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
              >
                Telefone
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
              >
                Faixa de valor
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
              >
                Origem
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
              >
                Data
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);

              return (
                <tr
                  key={lead.id}
                  className="group border-b border-zinc-200 last:border-b-0"
                >
                  <td className={`px-3 py-3 ${LEADS_TD_HOVER}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) =>
                        toggleOne(lead.id, event.target.checked)
                      }
                      aria-label={`Selecionar lead ${lead.name}`}
                      className="size-4 rounded border-zinc-300 text-green-700 focus:ring-green-600/30"
                    />
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-900 ${LEADS_TD_HOVER}`}
                  >
                    {lead.name}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-sm text-zinc-600 ${LEADS_TD_HOVER}`}
                  >
                    {formatPhoneForDisplay(lead.phone)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-zinc-600 ${LEADS_TD_HOVER}`}>
                    {lead.desiredPriceRange ?? "—"}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-sm text-zinc-600 ${LEADS_TD_HOVER}`}
                  >
                    {getOriginDisplayLabel(lead.origin, lead.manualSource)}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 ${LEADS_TD_HOVER}`}>
                    <LeadStatusSelect
                      leadId={lead.id}
                      currentStatus={lead.status}
                    />
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-sm text-zinc-500 ${LEADS_TD_HOVER}`}
                  >
                    {formatDate(lead.createdAt)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right ${LEADS_TD_HOVER}`}
                  >
                    <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-sm font-medium text-green-700 hover:text-green-800"
                      >
                        Ver
                      </Link>
                      <span className="text-zinc-300" aria-hidden>
                        |
                      </span>
                      <LeadDeleteButton leadId={lead.id} leadName={lead.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
