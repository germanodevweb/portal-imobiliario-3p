/**
 * Gera PNG/JPG de teste em scripts/output/ (gitignored).
 * Uso: pnpm exec tsx scripts/generate-folder-samples.ts
 */
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { hasPropertyDevelopmentNameColumn } from "@/lib/admin/schema-migration";
import { getSiteWhatsAppPhoneDisplay } from "@/lib/constants/contato";
import { buildFolderPropertyDefaults } from "@/lib/folder/build-folder-defaults";
import { generatePropertyFolderImage } from "@/lib/folder/generate-folder-image";
import { mergeFolderPayloadWithCadastro } from "@/lib/folder/merge-folder-payload";
import type { FolderVerticalEditablePayload, FolderVariant } from "@/lib/folder/types";

type SampleCase = {
  label: string;
  slug?: string;
  find?: () => Promise<string | null>;
  overrides?: Partial<FolderVerticalEditablePayload>;
};

async function resolveBeachClassSlug(): Promise<string | null> {
  const row = await prisma.property.findFirst({
    where: { title: { contains: "Beach Class Essence", mode: "insensitive" } },
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
  });
  return row?.slug ?? null;
}

async function resolveTerrenoSlug(): Promise<string | null> {
  const row = await prisma.property.findFirst({
    where: {
      bedrooms: 0,
      garage: 0,
      OR: [
        { type: "TERRENO" },
        { title: { contains: "lote", mode: "insensitive" } },
        { title: { contains: "terreno", mode: "insensitive" } },
      ],
    },
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
  });
  return row?.slug ?? null;
}

async function resolveLazerNoOneVagaSlug(): Promise<string | null> {
  const row = await prisma.property.findFirst({
    where: { garage: 1, bedrooms: { gte: 0 } },
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
  });
  return row?.slug ?? null;
}

const CASES: SampleCase[] = [
  { label: "viver-club", slug: "viver-club-mais-que-morar-e-pertencer" },
  { label: "beach-class-meireles", find: resolveBeachClassSlug },
  { label: "terreno-lote", find: resolveTerrenoSlug },
  {
    label: "lazer-nao-1-vaga",
    find: resolveLazerNoOneVagaSlug,
    overrides: {
      showLeisure: false,
      highlightGarage: 1,
      highlightBedrooms: 0,
    },
  },
];

async function loadProperty(slug: string, includeDevelopmentName: boolean) {
  return prisma.property.findFirst({
    where: { slug },
    select: {
      slug: true,
      title: true,
      neighborhood: true,
      city: true,
      featuredImage: true,
      bedrooms: true,
      garage: true,
      isLaunch: true,
      isOpportunity: true,
      isFeatured: true,
      ...(includeDevelopmentName ? { developmentName: true } : {}),
      images: {
        select: {
          url: true,
          isPrimary: true,
          isHidden: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

async function generateForCase(
  label: string,
  slug: string,
  overrides: Partial<FolderVerticalEditablePayload> | undefined,
  outDir: string,
  phone: string,
  includeDevelopmentName: boolean
) {
  const property = await loadProperty(slug, includeDevelopmentName);
  if (!property) {
    console.warn(`[${label}] imóvel não encontrado: ${slug}`);
    return;
  }

  const developmentName =
    includeDevelopmentName && "developmentName" in property
      ? (property.developmentName as string | null)
      : null;

  const base = buildFolderPropertyDefaults({
    id: "sample",
    slug: property.slug,
    title: property.title,
    developmentName,
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

  const editable: FolderVerticalEditablePayload = {
    sealBannerText: overrides?.sealBannerText ?? base.sealBannerText,
    showFullPhoto: overrides?.showFullPhoto ?? base.showFullPhoto,
    highlightBedrooms: overrides?.highlightBedrooms ?? base.highlightBedrooms,
    showLeisure: overrides?.showLeisure ?? base.showLeisure,
    highlightGarage: overrides?.highlightGarage ?? base.highlightGarage,
    phone: overrides?.phone ?? phone,
  };

  const merged = mergeFolderPayloadWithCadastro(
    {
      title: property.title,
      developmentName,
      neighborhood: property.neighborhood,
      city: property.city,
      featuredImage: property.featuredImage,
      images: property.images,
    },
    editable
  );

  if ("error" in merged) {
    console.warn(`[${label}] ${merged.error}`);
    return;
  }

  for (const variant of ["vertical", "feed"] as FolderVariant[]) {
    for (const format of ["png", "jpeg"] as const) {
      try {
        const buf = await generatePropertyFolderImage(merged, variant, format);
        const ext = format === "jpeg" ? "jpg" : "png";
        const suffix = variant === "feed" ? "feed" : "vertical";
        const file = path.join(outDir, `${label}-${suffix}.${ext}`);
        await writeFile(file, Buffer.from(buf));
        console.log("OK", file);
      } catch (e) {
        console.warn(`[${label}] ${variant} ${format}:`, e instanceof Error ? e.message : e);
      }
    }
  }
}

async function main() {
  const outDir = path.join(process.cwd(), "scripts", "output");
  await mkdir(outDir, { recursive: true });

  const phone = getSiteWhatsAppPhoneDisplay();
  if (!phone) {
    console.error(
      "NEXT_PUBLIC_WHATSAPP_PHONE não definido — necessário para gerar amostras."
    );
    process.exit(1);
  }

  const includeDevelopmentName = await hasPropertyDevelopmentNameColumn();

  for (const sample of CASES) {
    const slug = sample.slug ?? (sample.find ? await sample.find() : null);
    if (!slug) {
      console.warn(`[${sample.label}] slug não resolvido`);
      continue;
    }
    await generateForCase(
      sample.label,
      slug,
      sample.overrides,
      outDir,
      phone,
      includeDevelopmentName
    );
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
