import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  AdminImovelForm,
  type EditFormInitialData,
} from "@/app/components/admin/AdminImovelForm";
import type { GalleryImageItem } from "@/app/components/admin/PropertyImageGallery";
import { IMAGE_ENVIRONMENTS, OTHER_ENVIRONMENT_VALUE } from "@/lib/constants/image-environments";

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
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!property) notFound();

  const initialData: EditFormInitialData = {
    title: property.title,
    slug: property.slug,
    description: property.description ?? "",
    price: String(property.price),
    city: property.city,
    neighborhood: property.neighborhood ?? "",
    state: property.state,
    type: property.type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    garage: property.garage,
    area: property.area != null ? String(property.area) : "",
    status: property.isSold ? "VENDIDO" : "DISPONIVEL",
    isFeatured: property.isFeatured,
    isLaunch: property.isLaunch,
    isOpportunity: property.isOpportunity,
    ownerName: property.ownerName ?? "",
    ownerPhone: property.ownerPhone ?? "",
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
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900">
        Editar imóvel
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        {property.title} — <span className="font-mono">{property.slug}</span>
      </p>
      <AdminImovelForm
        mode="edit"
        propertyId={property.id}
        initialData={initialData}
      />
    </div>
  );
}
