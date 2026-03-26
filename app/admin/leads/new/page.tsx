import { AdminLeadForm } from "@/app/components/admin/AdminLeadForm";

/**
 * Página de cadastro manual de lead.
 * Restrito ao painel admin. Origem = manual, status = novo.
 */
export default function AdminLeadsNewPage() {
  return (
    <div className="pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Novo lead
        </h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base">
          Cadastre um lead manualmente. Origem e status serão definidos
          automaticamente.
        </p>
      </header>

      <AdminLeadForm />
    </div>
  );
}
