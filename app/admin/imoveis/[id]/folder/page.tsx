import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPropertyFolderForm } from "@/app/components/admin/AdminPropertyFolderForm";
import { buildFolderPropertyDefaults } from "@/lib/folder/build-folder-defaults";
import { getAdminPropertyForEdit } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPropertyFolderPage({ params }: PageProps) {
  const { id: propertyId } = await params;
  if (!propertyId?.trim()) notFound();

  const property = await getAdminPropertyForEdit(propertyId);
  if (!property) notFound();

  const defaults = buildFolderPropertyDefaults({
    id: property.id,
    slug: property.slug,
    youtubeVideoId: property.youtubeVideoId,
    title: property.title,
    developmentName: property.developmentName,
    neighborhood: property.neighborhood,
    city: property.city,
    bedrooms: property.bedrooms,
    garage: property.garage,
    isLaunch: property.isLaunch,
    isOpportunity: property.isOpportunity,
    isFeatured: property.isFeatured,
    featuredImage: property.featuredImage,
    images: property.images,
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/imoveis"
          className="text-sm font-medium text-zinc-300 hover:text-white"
        >
          ← Imóveis
        </Link>
        <span className="text-zinc-600">·</span>
        <Link
          href={`/admin/imoveis/${property.id}/editar`}
          className="text-sm font-medium text-green-400 hover:text-green-300"
        >
          Editar cadastro
        </Link>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-white">Folder de divulgação</h1>
      <p className="mt-2 text-sm text-zinc-300">
        {property.title} — <span className="font-mono">{property.slug}</span>
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Vertical 1080×1920 (Story) · Feed 1080×1350 (Instagram).
      </p>
      {!defaults.primaryPhotoUrl ? (
        <p className="mt-4 rounded-lg border border-amber-600/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          Este imóvel não tem foto principal. Adicione uma imagem no cadastro antes de gerar o
          folder.
        </p>
      ) : null}
      <div className="mt-8">
        <AdminPropertyFolderForm defaults={defaults} />
      </div>
    </div>
  );
}
