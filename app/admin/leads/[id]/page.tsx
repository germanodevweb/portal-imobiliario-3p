import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOriginDisplayLabel } from "@/lib/constants/leads";
import { LeadStatusSelect } from "@/app/components/admin/LeadStatusSelect";
import { LeadNotesEditor } from "@/app/components/admin/LeadNotesEditor";

/**
 * Detalhe de um lead — status e anotações editáveis.
 * Server Component. Restrito ao painel admin.
 */
export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!lead) {
    notFound();
  }

  const originLabel = getOriginDisplayLabel(lead.origin, lead.manualSource);

  return (
    <div className="pb-12">
      <div className="mb-6">
        <Link
          href="/admin/leads"
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← Voltar para Leads
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {lead.name}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Lead cadastrado em {formatDate(lead.createdAt)}
        </p>
      </header>

      <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Telefone
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-900">
              {lead.phone}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Faixa de valor
            </dt>
            <dd className="mt-1 text-sm text-zinc-900">
              {lead.desiredPriceRange ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Origem
            </dt>
            <dd className="mt-1 text-sm text-zinc-900">{originLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Status
            </dt>
            <dd className="mt-1">
              <LeadStatusSelect
                leadId={lead.id}
                currentStatus={lead.status}
              />
            </dd>
          </div>
        </div>

        <div>
          <LeadNotesEditor leadId={lead.id} initialNotes={lead.notes} />
        </div>

        <div className="border-t border-zinc-100 pt-4">
          <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Atualizado em
          </dt>
          <dd className="mt-1 text-sm text-zinc-500">
            {formatDate(lead.updatedAt)}
          </dd>
        </div>
      </div>
    </div>
  );
}
