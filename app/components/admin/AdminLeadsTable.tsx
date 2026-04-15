import Link from "next/link";
import type { AdminLeadListItem } from "@/lib/admin/queries";
import { LeadStatusSelect } from "@/app/components/admin/LeadStatusSelect";
import { LeadDeleteButton } from "@/app/components/admin/LeadDeleteButton";
import { getOriginDisplayLabel } from "@/lib/constants/leads";

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
 * Tabela administrativa de leads.
 */
export function AdminLeadsTable({ leads, isFiltered }: Props) {
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
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="min-w-full border-collapse">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
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
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="group border-b border-zinc-200 last:border-b-0"
            >
              <td
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-900 ${LEADS_TD_HOVER}`}
              >
                {lead.name}
              </td>
              <td
                className={`whitespace-nowrap px-4 py-3 text-sm text-zinc-600 ${LEADS_TD_HOVER}`}
              >
                {lead.phone}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
