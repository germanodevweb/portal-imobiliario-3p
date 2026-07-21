import Link from "next/link";
import type { AdminPropertyListItem } from "@/lib/admin/queries";
import { PropertyRowActions } from "@/app/components/admin/PropertyRowActions";
import { AdminPropertyThumbnail } from "@/app/components/admin/AdminPropertyThumbnail";
import { formatPropertyPriceBrl } from "@/lib/utils/property-price";
import { parseYouTubeVideoId } from "@/lib/utils/youtube";

/** URL absoluta para miniatura no admin (sem marca d’água — evita URL inválida se overlay não existir). */
function thumbnailSrc(url: string | null): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return u;
  if (/^www\./i.test(u)) return `https://${u}`;
  return u;
}

type Props = {
  properties: AdminPropertyListItem[];
  /** Quando true, exibe mensagem de "nenhum resultado" em vez de "nenhum imóvel cadastrado" */
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

function locationLabel(property: AdminPropertyListItem): string {
  return property.neighborhood
    ? `${property.neighborhood}, ${property.city}`
    : property.city;
}

/**
 * Células da tabela desktop: hover em <tr> não pinta fundo em WebKit/Chrome estável.
 * O verde leve aplica-se em cada <td> com .group no <tr>.
 */
function adminTableTd(published: boolean, align: "top" | "middle" = "middle"): string {
  const alignCls = align === "top" ? "align-top" : "align-middle";
  return published
    ? `px-4 py-3 ${alignCls} bg-white transition-colors duration-200 group-hover:bg-green-50`
    : `px-4 py-3 ${alignCls} bg-zinc-100/60 transition-colors duration-200 group-hover:bg-green-50`;
}

/** Coluna de ações fixa à direita — botões 2×2 sempre visíveis ao rolar a tabela */
function adminTableActionsTd(published: boolean): string {
  const bg = published
    ? "bg-white group-hover:bg-green-50"
    : "bg-zinc-100/60 group-hover:bg-green-50";
  return `sticky right-0 z-10 w-[6.5rem] min-w-[6.5rem] max-w-[6.5rem] px-2 py-3 align-top shadow-[-8px_0_16px_-12px_rgba(0,0,0,0.2)] transition-colors duration-200 ${bg}`;
}

const adminTableActionsTh =
  "sticky right-0 z-20 w-[6.5rem] min-w-[6.5rem] max-w-[6.5rem] bg-zinc-50 px-2 py-3 shadow-[-8px_0_16px_-12px_rgba(0,0,0,0.12)]";

function PropertyStatusBadges({ property }: { property: AdminPropertyListItem }) {
  return (
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
  );
}

function PropertyVideoBadge({ youtubeVideoId }: { youtubeVideoId: string | null }) {
  const hasVideo = parseYouTubeVideoId(youtubeVideoId) !== null;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        hasVideo ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {hasVideo ? "Sim" : "Não"}
    </span>
  );
}

function AdminImovelCard({ property }: { property: AdminPropertyListItem }) {
  const thumb = thumbnailSrc(property.listThumbnailUrl);

  return (
    <article
      className={`rounded-xl border-2 border-zinc-300 bg-white shadow-sm ring-0 transition-all duration-200 hover:border-green-600 hover:bg-green-50 hover:shadow-lg hover:ring-2 hover:ring-green-200/80 ${
        property.published
          ? ""
          : "border-zinc-300 bg-zinc-100/70 hover:bg-green-50"
      }`}
    >
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-t-xl bg-zinc-100">
        {thumb ? (
          <AdminPropertyThumbnail
            src={thumb}
            sizes="(max-width: 1024px) 100vw, 80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-zinc-400">
            Sem imagem
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p
            className={`text-base font-semibold leading-snug wrap-break-word ${
              property.published ? "text-zinc-900" : "text-zinc-700"
            }`}
          >
            {property.title}
          </p>
          {property.slug && (
            <p className="mt-1 break-all font-mono text-sm text-zinc-500">
              {property.slug}
            </p>
          )}
          <p className="mt-2 text-sm text-zinc-600">{locationLabel(property)}</p>
          {property.builderName ? (
            <p className="mt-1 text-sm text-zinc-500">{property.builderName}</p>
          ) : null}
          <p className="mt-2 text-lg font-semibold tabular-nums text-zinc-900">
            {formatPropertyPriceBrl(property.price)}
          </p>
        </div>

        <PropertyStatusBadges property={property} />

        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <span className="font-medium text-zinc-700">Vídeo:</span>
          <PropertyVideoBadge youtubeVideoId={property.youtubeVideoId} />
        </div>

        <div className="space-y-3 border-t border-zinc-100 pt-3">
          <p className="text-sm text-zinc-500">{formatDate(property.updatedAt)}</p>
          <PropertyRowActions
            propertyId={property.id}
            slug={property.slug}
            title={property.title}
            published={property.published}
          />
        </div>
      </div>
    </article>
  );
}

/**
 * Tabela administrativa de imóveis.
 * Em telas &lt; lg: lista em cards (melhor leitura no mobile).
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
    <>
      {/* Mobile / tablet: cards */}
      <div className="space-y-5 lg:hidden">
        {properties.map((property) => (
          <AdminImovelCard key={property.id} property={property} />
        ))}
      </div>

      {/* Desktop: tabela — coluna de ações sticky à direita */}
      <div className="hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[64rem] border-collapse">
            <thead className="border-b-2 border-zinc-200 bg-zinc-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
                >
                  Imóvel
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
                >
                  Localização
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
                >
                  Construtora
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
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
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
                >
                  Vídeo
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
                >
                  Atualizado
                </th>
                <th scope="col" className={adminTableActionsTh}>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => {
                const thumb = thumbnailSrc(property.listThumbnailUrl);
                return (
                  <tr
                    key={property.id}
                    className="group border-b border-zinc-300 last:border-b-0"
                  >
                    <td className={adminTableTd(property.published)}>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                          {thumb ? (
                            <AdminPropertyThumbnail src={thumb} sizes="64px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                              Sem img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`line-clamp-2 font-medium ${
                              property.published ? "text-zinc-900" : "text-zinc-600"
                            }`}
                          >
                            {property.title}
                          </p>
                          {property.slug && (
                            <p className="mt-0.5 font-mono text-xs text-zinc-500">
                              {property.slug}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`${adminTableTd(property.published)} text-sm text-zinc-600`}
                    >
                      {locationLabel(property)}
                    </td>
                    <td
                      className={`${adminTableTd(property.published)} text-sm text-zinc-600`}
                    >
                      {property.builderName ?? "—"}
                    </td>
                    <td
                      className={`${adminTableTd(property.published)} text-sm font-medium tabular-nums text-zinc-900`}
                    >
                      {formatPropertyPriceBrl(property.price)}
                    </td>
                    <td className={adminTableTd(property.published)}>
                      <PropertyStatusBadges property={property} />
                    </td>
                    <td className={adminTableTd(property.published)}>
                      <PropertyVideoBadge youtubeVideoId={property.youtubeVideoId} />
                    </td>
                    <td
                      className={`${adminTableTd(property.published)} text-sm text-zinc-500`}
                    >
                      {formatDate(property.updatedAt)}
                    </td>
                    <td className={adminTableActionsTd(property.published)}>
                      <PropertyRowActions
                        propertyId={property.id}
                        slug={property.slug}
                        title={property.title}
                        published={property.published}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
