import Link from "next/link";
import type { AdminLeadListItem } from "@/lib/admin/queries";
import { LeadStatusSelect } from "@/app/components/admin/LeadStatusSelect";
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
      <table className="min-w-full divide-y divide-zinc-200">
        <thead>
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Nome
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Telefone
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Faixa de valor
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Origem
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Data
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="transition-colors hover:bg-zinc-50/50"
            >
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-900">
                {lead.name}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-600">
                {lead.phone}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-600">
                {lead.desiredPriceRange ?? "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-600">
                {getOriginDisplayLabel(lead.origin, lead.manualSource)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <LeadStatusSelect
                  leadId={lead.id}
                  currentStatus={lead.status}
                />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-500">
                {formatDate(lead.createdAt)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="text-sm font-medium text-green-700 hover:text-green-800"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
