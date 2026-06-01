import {
  AdminImovelForm,
} from "@/app/components/admin/AdminImovelForm";
import { getRegisteredNeighborhoodOptions } from "@/lib/admin/neighborhood-queries";
import { getRegisteredBuilderOptions } from "@/lib/admin/builder-queries";
import { getRegisteredCityOptions } from "@/lib/admin/city-queries";

/**
 * Página de cadastro de novo imóvel.
 * Usa o mesmo formulário da edição, em modo create.
 */
export default async function AdminImoveisNovoPage() {
  let registeredNeighborhoods: Awaited<
    ReturnType<typeof getRegisteredNeighborhoodOptions>
  > = [];
  let registeredBuilders: Awaited<ReturnType<typeof getRegisteredBuilderOptions>> =
    [];
  let registeredCities: Awaited<ReturnType<typeof getRegisteredCityOptions>> = [];

  try {
    registeredNeighborhoods = await getRegisteredNeighborhoodOptions();
  } catch {
    /* tabela Neighborhood ausente ou indisponível */
  }

  try {
    registeredBuilders = await getRegisteredBuilderOptions();
  } catch {
    /* tabela Builder ausente ou indisponível */
  }

  try {
    registeredCities = await getRegisteredCityOptions();
  } catch {
    /* tabela City ausente ou indisponível */
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
        Novo imóvel
      </h1>
      <p className="mb-6 text-sm text-zinc-300">
        Preencha os dados do imóvel. Campos marcados com * são obrigatórios.
      </p>
      <AdminImovelForm
        mode="create"
        registeredNeighborhoods={registeredNeighborhoods}
        registeredBuilders={registeredBuilders}
        registeredCities={registeredCities}
      />
    </div>
  );
}
