"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseYouTubeVideoId } from "@/lib/utils/youtube";
import type { PropertyType } from "@/lib/generated/prisma/client";
import { generatePropertyContent } from "@/lib/ai/property";
import { uploadPropertyImage } from "@/lib/upload/cloudinary";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type CreatePropertyState = {
  errors?: Record<string, string>;
};

export type UpdatePropertyState = {
  errors?: Record<string, string>;
};

const PROPERTY_TYPE_TO_SLUG: Record<PropertyType, string> = {
  CASA: "casa",
  APARTAMENTO: "apartamento",
  COBERTURA: "cobertura",
  TERRENO: "terreno",
  COMERCIAL: "comercial",
  STUDIO: "studio",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type ImagesDataItem = {
  url: string;
  alt: string;
  environment: string;
  environmentCustom: string;
  isPrimary: boolean;
  isHidden: boolean;
  sortOrder: number;
};

function parseImagesData(str: string | undefined): ImagesDataItem[] {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ImagesDataItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ImagesDataItem).url === "string"
    );
  } catch {
    return [];
  }
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 0;
  while (true) {
    const existing = await prisma.property.findUnique({ where: { slug } });
    if (!existing) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

/** Para edição: garante slug único excluindo o imóvel atual */
async function ensureUniqueSlugForEdit(
  baseSlug: string,
  excludeId: string
): Promise<string> {
  let slug = baseSlug;
  let suffix = 0;
  while (true) {
    const existing = await prisma.property.findFirst({
      where: { slug, id: { not: excludeId } },
    });
    if (!existing) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

// ---------------------------------------------------------------------------
// Server Action: upload de imagem principal
// ---------------------------------------------------------------------------

export type UploadPropertyImageState = { url?: string; error?: string };

export async function uploadPropertyImageAction(
  _prevState: UploadPropertyImageState,
  formData: FormData
): Promise<UploadPropertyImageState> {
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: "Selecione uma imagem" };
  }
  try {
    const result = await uploadPropertyImage(file);
    if (result.ok) return { url: result.url };
    return { error: result.error };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao fazer upload";
    return { error: msg };
  }
}

// ---------------------------------------------------------------------------
// Server Action: assistente de IA (gera sugestão, não persiste)
// ---------------------------------------------------------------------------

export type GeneratePropertyContentState = {
  title?: string;
  description?: string;
  error?: string;
};

export async function generatePropertyContentAction(
  _prevState: GeneratePropertyContentState,
  formData: FormData
): Promise<GeneratePropertyContentState> {
  const prompt = (formData.get("aiPrompt") as string)?.trim() ?? "";
  const type = (formData.get("type") as string)?.trim() || undefined;
  const city = (formData.get("city") as string)?.trim() || undefined;
  const bedroomsStr = (formData.get("bedrooms") as string)?.trim();
  const priceStr = (formData.get("price") as string)?.trim();

  const bedrooms = bedroomsStr ? parseInt(bedroomsStr, 10) : undefined;
  const price = priceStr ? Number(priceStr) : undefined;

  try {
    const result = await generatePropertyContent({
      prompt,
      context: { type, city, bedrooms, price },
    });
    return { title: result.title, description: result.description };
  } catch (e) {
    return {
      error: "Não foi possível gerar a sugestão. Tente novamente.",
    };
  }
}

// ---------------------------------------------------------------------------
// Server Action: criar imóvel
// ---------------------------------------------------------------------------

export async function createPropertyAction(
  _prevState: CreatePropertyState,
  formData: FormData
): Promise<CreatePropertyState> {
  const errors: Record<string, string> = {};

  const title = (formData.get("title") as string)?.trim();
  const slugInput = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priceStr = (formData.get("price") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const neighborhood = (formData.get("neighborhood") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim();
  const typeStr = (formData.get("type") as string)?.trim();
  const bedrooms = parseInt((formData.get("bedrooms") as string) || "0", 10);
  const bathrooms = parseInt((formData.get("bathrooms") as string) || "0", 10);
  const garage = parseInt((formData.get("garage") as string) || "0", 10);
  const areaStr = (formData.get("area") as string)?.trim();
  const imagesDataStr = (formData.get("imagesData") as string)?.trim();
  const imagesData = parseImagesData(imagesDataStr);
  const status = (formData.get("status") as string)?.trim();
  const ownerName = (formData.get("ownerName") as string)?.trim() || null;
  const ownerPhone = (formData.get("ownerPhone") as string)?.trim() || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const isLaunch = formData.get("isLaunch") === "on";
  const isOpportunity = formData.get("isOpportunity") === "on";
  const youtubeVideoId = parseYouTubeVideoId(formData.get("youtubeVideoId") as string);

  if (!title) errors.title = "Título é obrigatório";
  if (slugInput && !/^[a-z0-9-]+$/.test(slugInput)) {
    errors.slug = "Slug deve conter apenas letras minúsculas, números e hífens";
  }
  if (!priceStr) {
    errors.price = "Preço é obrigatório";
  } else if (isNaN(Number(priceStr)) || Number(priceStr) <= 0) {
    errors.price = "Preço deve ser um número positivo";
  }
  if (!city) errors.city = "Cidade é obrigatória";
  if (!state) errors.state = "Estado é obrigatório";
  if (!typeStr) {
    errors.type = "Tipo de imóvel é obrigatório";
  } else if (!PROPERTY_TYPE_TO_SLUG[typeStr as PropertyType]) {
    errors.type = "Tipo de imóvel inválido";
  }
  if (!status || (status !== "DISPONIVEL" && status !== "VENDIDO")) {
    errors.status = "Status deve ser DISPONIVEL ou VENDIDO";
  }
  if (bedrooms < 0) errors.bedrooms = "Deve ser 0 ou mais";
  if (bathrooms < 0) errors.bathrooms = "Deve ser 0 ou mais";
  if (garage < 0) errors.garage = "Deve ser 0 ou mais";
  if (areaStr && (isNaN(Number(areaStr)) || Number(areaStr) < 0)) {
    errors.area = "Área deve ser um número positivo";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const price = Number(priceStr);
  const area = areaStr ? Number(areaStr) : null;
  const propertyType = typeStr as PropertyType;
  const propertyTypeSlug = PROPERTY_TYPE_TO_SLUG[propertyType];
  const isSold = status === "VENDIDO";

  const citySlug = slugify(city);
  const neighborhoodSlug = neighborhood ? slugify(neighborhood) : null;

  const baseSlug =
    slugInput ||
    (slugify(title) || `imovel-${propertyTypeSlug}-${citySlug}-${Date.now().toString(36)}`);
  const slug = await ensureUniqueSlug(baseSlug);

  const validImages = imagesData.filter((i) => i.url.startsWith("http://") || i.url.startsWith("https://"));
  const visibleImages = validImages.filter((i) => !i.isHidden).sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImage = validImages.find((i) => i.isPrimary) ?? visibleImages[0];
  const featuredImage = primaryImage?.url?.trim() || null;
  const featuredImageAlt = primaryImage?.alt?.trim() || null;
  const galleryImages = visibleImages.map((i) => i.url);

  const property = await prisma.property.create({
    data: {
      slug,
      title,
      description,
      transactionType: "SALE",
      price,
      city,
      neighborhood,
      state,
      citySlug,
      neighborhoodSlug,
      stateSlug: slugify(state),
      propertyTypeSlug,
      type: propertyType,
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      garage: garage || 0,
      area,
      featuredImage,
      featuredImageAlt,
      galleryImages,
      isSold,
      isFeatured,
      isLaunch,
      isOpportunity,
      published: false,
      ownerName,
      ownerPhone,
      youtubeVideoId,
    },
  });

  for (let i = 0; i < validImages.length; i++) {
    const img = validImages[i];
    const envValue = img.environment === "__OTHER__" ? img.environmentCustom : img.environment;
    await prisma.propertyImage.create({
      data: {
        propertyId: property.id,
        url: img.url,
        alt: img.alt?.trim() || null,
        environment: envValue?.trim() || null,
        isPrimary: img.isPrimary,
        isHidden: img.isHidden,
        sortOrder: i,
      },
    });
  }

  revalidatePath("/admin/imoveis");
  redirect("/admin/imoveis");
}

// ---------------------------------------------------------------------------
// Server Actions: arquivar, publicar, excluir
// Com form action sem useActionState, Next.js passa FormData como 1º argumento.
// ---------------------------------------------------------------------------

function getFormDataFromArgs(
  a: unknown,
  b?: FormData
): FormData | undefined {
  return a instanceof FormData ? a : b;
}

export async function archivePropertyAction(
  prevStateOrFormData: unknown,
  formDataArg?: FormData
): Promise<{ error?: string }> {
  const formData = getFormDataFromArgs(prevStateOrFormData, formDataArg);
  if (!formData) return { error: "Dados do formulário não recebidos" };
  const propertyId = (formData.get("propertyId") as string)?.trim();
  if (!propertyId) return { error: "ID não informado" };

  const existing = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, slug: true },
  });
  if (!existing) return { error: "Imóvel não encontrado" };

  await prisma.property.update({
    where: { id: propertyId },
    data: { published: false, publishedAt: null },
  });

  revalidatePath("/admin/imoveis");
  revalidatePath("/imoveis");
  revalidatePath(`/imoveis/${existing.slug}`);
  redirect("/admin/imoveis");
}

export async function publishPropertyAction(
  prevStateOrFormData: unknown,
  formDataArg?: FormData
): Promise<{ error?: string }> {
  const formData = getFormDataFromArgs(prevStateOrFormData, formDataArg);
  if (!formData) return { error: "Dados do formulário não recebidos" };
  const propertyId = (formData.get("propertyId") as string)?.trim();
  if (!propertyId) return { error: "ID não informado" };

  const existing = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, slug: true },
  });
  if (!existing) return { error: "Imóvel não encontrado" };

  await prisma.property.update({
    where: { id: propertyId },
    data: { published: true, publishedAt: new Date() },
  });

  revalidatePath("/admin/imoveis");
  revalidatePath("/imoveis");
  revalidatePath(`/imoveis/${existing.slug}`);
  redirect("/admin/imoveis");
}

export async function deletePropertyAction(
  prevStateOrFormData: unknown,
  formDataArg?: FormData
): Promise<{ error?: string }> {
  const formData = getFormDataFromArgs(prevStateOrFormData, formDataArg);
  if (!formData) return { error: "Dados do formulário não recebidos" };
  const propertyId = (formData.get("propertyId") as string)?.trim();
  if (!propertyId) return { error: "ID não informado" };

  const existing = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, slug: true },
  });
  if (!existing) return { error: "Imóvel não encontrado" };

  await prisma.property.delete({
    where: { id: propertyId },
  });
  // PropertyImage é removido em cascade pelo schema

  revalidatePath("/admin/imoveis");
  revalidatePath("/imoveis");
  revalidatePath(`/imoveis/${existing.slug}`);
  redirect("/admin/imoveis");
}

// ---------------------------------------------------------------------------
// Server Action: atualizar imóvel
// ---------------------------------------------------------------------------

export async function updatePropertyAction(
  _prevState: UpdatePropertyState,
  formData: FormData
): Promise<UpdatePropertyState> {
  const errors: Record<string, string> = {};

  const propertyId = (formData.get("propertyId") as string)?.trim();
  if (!propertyId) {
    return { errors: { _form: "ID do imóvel não informado" } };
  }

  const title = (formData.get("title") as string)?.trim();
  const slugInput = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priceStr = (formData.get("price") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const neighborhood = (formData.get("neighborhood") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim();
  const typeStr = (formData.get("type") as string)?.trim();
  const bedrooms = parseInt((formData.get("bedrooms") as string) || "0", 10);
  const bathrooms = parseInt((formData.get("bathrooms") as string) || "0", 10);
  const garage = parseInt((formData.get("garage") as string) || "0", 10);
  const areaStr = (formData.get("area") as string)?.trim();
  const imagesDataStr = (formData.get("imagesData") as string)?.trim();
  const imagesData = parseImagesData(imagesDataStr);
  const status = (formData.get("status") as string)?.trim();
  const ownerName = (formData.get("ownerName") as string)?.trim() || null;
  const ownerPhone = (formData.get("ownerPhone") as string)?.trim() || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const isLaunch = formData.get("isLaunch") === "on";
  const isOpportunity = formData.get("isOpportunity") === "on";
  const youtubeVideoId = parseYouTubeVideoId(formData.get("youtubeVideoId") as string);

  if (!title) errors.title = "Título é obrigatório";
  if (slugInput && !/^[a-z0-9-]+$/.test(slugInput)) {
    errors.slug = "Slug deve conter apenas letras minúsculas, números e hífens";
  }
  if (!priceStr) {
    errors.price = "Preço é obrigatório";
  } else if (isNaN(Number(priceStr)) || Number(priceStr) <= 0) {
    errors.price = "Preço deve ser um número positivo";
  }
  if (!city) errors.city = "Cidade é obrigatória";
  if (!state) errors.state = "Estado é obrigatório";
  if (!typeStr) {
    errors.type = "Tipo de imóvel é obrigatório";
  } else if (!PROPERTY_TYPE_TO_SLUG[typeStr as PropertyType]) {
    errors.type = "Tipo de imóvel inválido";
  }
  if (!status || (status !== "DISPONIVEL" && status !== "VENDIDO")) {
    errors.status = "Status deve ser DISPONIVEL ou VENDIDO";
  }
  if (bedrooms < 0) errors.bedrooms = "Deve ser 0 ou mais";
  if (bathrooms < 0) errors.bathrooms = "Deve ser 0 ou mais";
  if (garage < 0) errors.garage = "Deve ser 0 ou mais";
  if (areaStr && (isNaN(Number(areaStr)) || Number(areaStr) < 0)) {
    errors.area = "Área deve ser um número positivo";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const existing = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, slug: true },
  });
  if (!existing) {
    return { errors: { _form: "Imóvel não encontrado" } };
  }

  const price = Number(priceStr);
  const area = areaStr ? Number(areaStr) : null;
  const propertyType = typeStr as PropertyType;
  const propertyTypeSlug = PROPERTY_TYPE_TO_SLUG[propertyType];
  const isSold = status === "VENDIDO";

  const citySlug = slugify(city);
  const neighborhoodSlug = neighborhood ? slugify(neighborhood) : null;

  const baseSlug =
    slugInput ||
    (slugify(title) || `imovel-${propertyTypeSlug}-${citySlug}-${Date.now().toString(36)}`);
  const slug =
    baseSlug === existing.slug
      ? existing.slug
      : await ensureUniqueSlugForEdit(baseSlug, propertyId);

  const validImages = imagesData.filter(
    (i) => i.url.startsWith("http://") || i.url.startsWith("https://")
  );
  const visibleImages = validImages
    .filter((i) => !i.isHidden)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImage = validImages.find((i) => i.isPrimary) ?? visibleImages[0];
  const featuredImage = primaryImage?.url?.trim() || null;
  const featuredImageAlt = primaryImage?.alt?.trim() || null;
  const galleryImages = visibleImages.map((i) => i.url);

  await prisma.$transaction(async (tx) => {
    await tx.property.update({
      where: { id: propertyId },
      data: {
        slug,
        title,
        description,
        price,
        city,
        neighborhood,
        state,
        citySlug,
        neighborhoodSlug,
        stateSlug: slugify(state),
        propertyTypeSlug,
        type: propertyType,
        bedrooms: bedrooms || 0,
        bathrooms: bathrooms || 0,
        garage: garage || 0,
        area,
        featuredImage,
        featuredImageAlt,
        galleryImages,
        isSold,
        isFeatured,
        isLaunch,
        isOpportunity,
        ownerName,
        ownerPhone,
        youtubeVideoId,
      },
    });

    await tx.propertyImage.deleteMany({ where: { propertyId } });

    for (let i = 0; i < validImages.length; i++) {
      const img = validImages[i];
      const envValue =
        img.environment === "__OTHER__" ? img.environmentCustom : img.environment;
      await tx.propertyImage.create({
        data: {
          propertyId,
          url: img.url,
          alt: img.alt?.trim() || null,
          environment: envValue?.trim() || null,
          isPrimary: img.isPrimary,
          isHidden: img.isHidden,
          sortOrder: i,
        },
      });
    }
  });

  revalidatePath("/admin/imoveis");
  revalidatePath(`/admin/imoveis/${propertyId}/editar`);
  revalidatePath("/imoveis");
  revalidatePath(`/imoveis/${slug}`);
  redirect("/admin/imoveis");
}
