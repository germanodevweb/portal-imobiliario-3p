import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { connection } from "next/server";
import Link from "next/link";
import { propertyPriceFormDefaultValue } from "@/lib/utils/property-price";
import { propertyAreaFormDefaults } from "@/lib/utils/property-area";
import {
  AdminImovelForm,
  type EditFormInitialData,
} from "@/app/components/admin/AdminImovelForm";
import type { GalleryImageItem } from "@/app/components/admin/PropertyImageGallery";
import { IMAGE_ENVIRONMENTS, OTHER_ENVIRONMENT_VALUE } from "@/lib/constants/image-environments";
import { getRegisteredNeighborhoodOptions } from "@/lib/admin/neighborhood-queries";
import { getRegisteredBuilderOptions } from "@/lib/admin/builder-queries";
import { getRegisteredCityOptions } from "@/lib/admin/city-queries";
import { getAdminPropertyForEdit } from "@/lib/admin/queries";
import { resolveAdminPropertyEditId } from "@/lib/admin/route-params";
import { isPendingSchemaMigrationError } from "@/lib/admin/schema-migration";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Mapeia PropertyImage para GalleryImageItem.
 * environment no banco pode ser value ("fachada") ou texto customizado.
 */
function mapImagesToGalleryItems(
  images: { url: string; alt: string | null; environment: string | null; isPrimary: boolean; isHidden: boolean; sortOrder: number }[]
): GalleryImageItem[] {
  return images.map((img) => {
    const env = img.environment?.trim() ?? "";
    const matched = IMAGE_ENVIRONMENTS.find(
      (e) => e.value === env || e.label.toLowerCase() === env.toLowerCase()
    );
    const environment = matched ? matched.value : env ? OTHER_ENVIRONMENT_VALUE : "";
    const environmentCustom = matched ? "" : env;
    return {
      url: img.url,
      alt: img.alt ?? "",
      environment,
      environmentCustom,
      isPrimary: img.isPrimary,
      isHidden: img.isHidden,
      sortOrder: img.sortOrder,
    };
  });
}

/**
 * Página de edição de imóvel.
 * Server Component — busca dados no servidor e renderiza o formulário (Client Component).
 */
export default async function AdminImoveisEditarPage({ params }: PageProps) {
  await connection();

  const { id: paramId } = await params;
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");
  const propertyId = resolveAdminPropertyEditId(paramId, pathname);

  if (!propertyId) notFound();

  let property: Awaited<ReturnType<typeof getAdminPropertyForEdit>>;
  try {
    property = await getAdminPropertyForEdit(propertyId);
  } catch (err) {
    console.error("[AdminImoveisEditarPage] Erro ao carregar imóvel:", err);
    const message = err instanceof Error ? err.message : String(err);
    const needsMigration = isPendingSchemaMigrationError(err);

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Erro ao abrir edição</h2>
        <p className="mt-2 text-sm text-red-700">{message}</p>
        {needsMigration ? (
          <p className="mt-3 text-sm text-red-900">
            Aplique a migration pendente no Supabase, rode{" "}
            <code className="rounded bg-red-100 px-1">pnpm prisma generate</code> e reinicie o
            servidor.
          </p>
        ) : null}
      </div>
    );
  }

  if (!property) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <h2 className="font-semibold">Imóvel não encontrado</h2>
        <p className="mt-2">
          Não há registro com o ID{" "}
          <code className="rounded bg-amber-100 px-1">{propertyId}</code> no banco de dados.
        </p>
        <Link
          href="/admin/imoveis"
          className="mt-4 inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
        >
          Voltar à listagem
        </Link>
      </div>
    );
  }

  let registeredNeighborhoods: Awaited<
    ReturnType<typeof getRegisteredNeighborhoodOptions>
  > = [];
  let registeredBuilders: Awaited<ReturnType<typeof getRegisteredBuilderOptions>> =
    [];
  let registeredCities: Awaited<ReturnType<typeof getRegisteredCityOptions>> = [];

  try {
    [registeredNeighborhoods, registeredBuilders, registeredCities] = await Promise.all([
      getRegisteredNeighborhoodOptions(),
      getRegisteredBuilderOptions(),
      getRegisteredCityOptions(),
    ]);
  } catch {
    try {
      registeredNeighborhoods = await getRegisteredNeighborhoodOptions();
    } catch {
      /* tabela Neighborhood ausente */
    }
    try {
      registeredBuilders = await getRegisteredBuilderOptions();
    } catch {
      /* tabela Builder ausente */
    }
    try {
      registeredCities = await getRegisteredCityOptions();
    } catch {
      /* tabela City ausente */
    }
  }

  const areaDefaults = propertyAreaFormDefaults({
    area: property.area,
    areaMin: property.areaMin,
    areaMax: property.areaMax,
  });

  const initialData: EditFormInitialData = {
    title: property.title,
    slug: property.slug,
    description: property.description ?? "",
    price: propertyPriceFormDefaultValue(String(property.price)),
    city: property.city,
    neighborhood: property.neighborhood ?? "",
    street: property.street ?? "",
    streetNumber: property.streetNumber ?? "",
    state: property.state,
    country: property.country ?? "",
    postalCode: property.postalCode ?? "",
    type: property.type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    garage: property.garage,
    areaMin: areaDefaults.areaMin,
    areaMax: areaDefaults.areaMax,
    status: property.isSold ? "VENDIDO" : "DISPONIVEL",
    isFeatured: property.isFeatured,
    isLaunch: property.isLaunch,
    isOpportunity: property.isOpportunity,
    ownerName: property.ownerName ?? "",
    ownerPhone: property.ownerPhone ?? "",
    builderName: property.builderName ?? "",
    youtubeVideoId: property.youtubeVideoId ?? "",
    images:
      property.images.length > 0
        ? mapImagesToGalleryItems(property.images)
        : property.galleryImages.length > 0
          ? property.galleryImages.map((url, i) => ({
              url,
              alt:
                property.featuredImage === url
                  ? (property.featuredImageAlt ?? "")
                  : "",
              environment: "",
              environmentCustom: "",
              isPrimary:
                property.featuredImage === url ||
                (i === 0 && !property.featuredImage),
              isHidden: false,
              sortOrder: i,
            }))
          : [],
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
        Editar imóvel
      </h1>
      <p className="mb-6 text-sm text-zinc-300">
        {property.title} — <span className="font-mono">{property.slug}</span>
      </p>
      <AdminImovelForm
        key={property.id}
        mode="edit"
        propertyId={property.id}
        initialData={initialData}
        registeredNeighborhoods={registeredNeighborhoods}
        registeredBuilders={registeredBuilders}
        registeredCities={registeredCities}
      />
    </div>
  );
}
