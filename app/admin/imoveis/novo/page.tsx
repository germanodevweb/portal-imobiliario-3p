import {
  AdminImovelForm,
} from "@/app/components/admin/AdminImovelForm";

/**
 * Página de cadastro de novo imóvel.
 * Usa o mesmo formulário da edição, em modo create.
 */
export default function AdminImoveisNovoPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900">
        Novo imóvel
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Preencha os dados do imóvel. Campos marcados com * são obrigatórios.
      </p>
      <AdminImovelForm mode="create" />
    </div>
  );
}
