import Link from "next/link";
import Image from "next/image";
import type { AdminPropertyListItem } from "@/lib/admin/queries";
import { PropertyRowActions } from "@/app/components/admin/PropertyRowActions";

type Props = {
  properties: AdminPropertyListItem[];
  /** Quando true, exibe mensagem de "nenhum resultado" em vez de "nenhum imóvel cadastrado" */
  isFiltered?: boolean;
};

function formatPrice(price: string): string {
  const n = Number(price);
  if (isNaN(n)) return price;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);
}

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
 * Tabela administrativa de imóveis.
 * Server Component — recebe dados via props.
 */
export function AdminImoveisTable({ properties, isFiltered }: Props) {
  if (properties.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
        <p className="text-zinc-500">
          {isFiltered
            ? "Nenhum imóvel encontrado para a busca."
            : "Nenhum imóvel cadastrado."}
        </p>
        {!isFiltered && (
          <Link
            href="/admin/imoveis/novo"
            className="mt-4 inline-block text-sm font-medium text-green-700 hover:text-green-800"
          >
            Cadastrar primeiro imóvel →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
              >
                Imóvel
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 sm:table-cell"
              >
                Localização
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 md:table-cell"
              >
                Preço
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
              >
                Status
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 lg:table-cell"
              >
                Atualizado
              </th>
              <th scope="col" className="relative px-4 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {properties.map((property) => (
              <tr
                key={property.id}
                className={`transition-colors ${
                  property.published
                    ? "hover:bg-zinc-50"
                    : "bg-zinc-50/50 hover:bg-zinc-100/80"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                      {property.featuredImage ? (
                        <Image
                          src={property.featuredImage}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                          Sem img
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-medium line-clamp-2 ${
                          property.published ? "text-zinc-900" : "text-zinc-600"
                        }`}
                      >
                        {property.title}
                      </p>
                      {property.slug && (
                        <p className="mt-0.5 text-xs text-zinc-500 font-mono">
                          {property.slug}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-sm text-zinc-600 sm:table-cell">
                  {property.neighborhood
                    ? `${property.neighborhood}, ${property.city}`
                    : property.city}
                </td>
                <td className="hidden px-4 py-3 text-sm font-medium text-zinc-900 md:table-cell">
                  {formatPrice(property.price)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        property.published
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {property.published ? "Publicado" : "Arquivado"}
                    </span>
                    {property.isFeatured && (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Destaque
                      </span>
                    )}
                    {property.isLaunch && (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Lançamento
                      </span>
                    )}
                    {property.isOpportunity && (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        Oportunidade
                      </span>
                    )}
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-sm text-zinc-500 lg:table-cell">
                  {formatDate(property.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <PropertyRowActions
                    propertyId={property.id}
                    title={property.title}
                    published={property.published}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
