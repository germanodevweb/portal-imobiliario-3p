"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseYouTubeVideoId } from "@/lib/utils/youtube";
import type { PropertyType, Prisma } from "@/lib/generated/prisma/client";
import { generatePropertyContent } from "@/lib/ai/property";
import { formatPropertyTypeLabel } from "@/lib/utils/property-seo-editorial";
import { uploadPropertyImage } from "@/lib/upload/cloudinary";
import { revalidateBlogPagesReferencingProperty } from "@/lib/admin/revalidate-blog-for-property";
import { propertyDetailRevalidateTag } from "@/lib/queries/properties";
import { PROPERTY_GALLERY_MAX_IMAGES } from "@/lib/constants/property-gallery";
import { validatePropertyPriceFormInput } from "@/lib/utils/property-price";
import { parsePropertyAreaFormInput } from "@/lib/utils/property-area";
import { resolveNeighborhoodForProperty } from "@/lib/admin/neighborhood-resolve";
import { resolveCityForProperty } from "@/lib/admin/city-resolve";
import { resolveBuilderForProperty } from "@/lib/admin/builder-resolve";
import {
  hasPropertyAreaRangeColumns,
  hasPropertyBuilderColumns,
  isPendingSchemaMigrationError,
  resetSchemaMigrationCache,
} from "@/lib/admin/schema-migration";
import { slugifyNeighborhood } from "@/lib/utils/neighborhood-normalize";

/** Next.js 16 exige o 2º argumento em `revalidateTag`; `"max"` alinha à invalidação imediata do cache do detalhe. */
function revalidatePropertyDetailBySlug(slug: string) {
  revalidateTag(propertyDetailRevalidateTag(slug), "max");
}

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
  LOTE: "lote",
  FAZENDA: "fazenda",
  COMERCIAL: "comercial",
  STUDIO: "studio",
};

function slugify(text: string): string {
  return slugifyNeighborhood(text);
}

function omitBuilderFields<T extends { builderName?: string | null; builderSlug?: string | null }>(
  data: T
): Omit<T, "builderName" | "builderSlug"> {
  const { builderName: _name, builderSlug: _slug, ...rest } = data;
  return rest;
}

function omitAreaRangeFields<T extends { areaMin?: number | null; areaMax?: number | null }>(
  data: T
): Omit<T, "areaMin" | "areaMax"> {
  const { areaMin: _min, areaMax: _max, ...rest } = data;
  return rest;
}

type PropertyOptionalSchemaFields = {
  builderName?: string | null;
  builderSlug?: string | null;
  areaMin?: number | null;
  areaMax?: number | null;
};

async function preparePropertyPersistData<T extends PropertyOptionalSchemaFields>(
  data: T
): Promise<T> {
  const [includeBuilder, includeAreaRange] = await Promise.all([
    hasPropertyBuilderColumns(),
    hasPropertyAreaRangeColumns(),
  ]);

  let result: T = data;
  if (!includeBuilder) result = omitBuilderFields(result) as T;
  if (!includeAreaRange) result = omitAreaRangeFields(result) as T;
  return result;
}

async function createPropertyWithOptionalSchema(data: Prisma.PropertyCreateInput) {
  return prisma.property.create({
    data: await preparePropertyPersistData(data),
  });
}

/** CEP brasileiro opcional: normaliza para NNNNN-NNN ou retorna erro. */
function parseOptionalPostalCode(raw: string | undefined): {
  value: string | null;
  error?: string;
} {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return { value: null };
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length !== 8) {
    return { value: null, error: "CEP deve conter 8 dígitos" };
  }
  return { value: `${digits.slice(0, 5)}-${digits.slice(5)}` };
}

type ImagesDataItem = {
  url: string;
  alt?: string;
  environment?: string;
  environmentCustom?: string;
  isPrimary?: boolean;
  isHidden?: boolean;
  sortOrder?: number;
};

const OTHER_ENVIRONMENT_SENTINEL = "__OTHER__";
const MAX_PROPERTY_IMAGE_ALT_LEN = 8000;
const MAX_PROPERTY_IMAGE_ENV_LEN = 2000;

type NormalizedPropertyImage = {
  url: string;
  alt: string | null;
  environment: string | null;
  isPrimary: boolean;
  isHidden: boolean;
  sortOrder: number;
};

function asTrimmedString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.replace(/\0/g, "").trim();
  return String(value).replace(/\0/g, "").trim();
}

function coerceBoolean(value: unknown): boolean {
  if (value === true || value === "true" || value === 1 || value === "1")
    return true;
  if (value === false || value === "false" || value === 0 || value === "0")
    return false;
  return false;
}

function coerceSortOrder(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n)) return Math.max(0, n);
  }
  return Math.max(0, fallback);
}

/** Normaliza JSON da galeria antes do Prisma (tipos soltos do cliente, URLs longas, ambiente “Outro”). */
function normalizePropertyImagesForDb(
  imagesData: ImagesDataItem[]
): NormalizedPropertyImage[] {
  return imagesData
    .map((raw, index) => {
      const url = asTrimmedString(raw.url);
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return null;
      }
      const env = asTrimmedString(raw.environment);
      const custom = asTrimmedString(raw.environmentCustom);
      let environment: string | null;
      if (env === OTHER_ENVIRONMENT_SENTINEL) {
        environment =
          custom && custom !== OTHER_ENVIRONMENT_SENTINEL ? custom : null;
      } else {
        environment =
          env && env !== OTHER_ENVIRONMENT_SENTINEL ? env : null;
      }
      if (environment) {
        environment = environment.slice(0, MAX_PROPERTY_IMAGE_ENV_LEN);
      }
      const altRaw = asTrimmedString(raw.alt);
      const alt = altRaw
        ? altRaw.slice(0, MAX_PROPERTY_IMAGE_ALT_LEN)
        : null;
      return {
        url,
        alt,
        environment,
        isPrimary: coerceBoolean(raw.isPrimary),
        isHidden: coerceBoolean(raw.isHidden),
        sortOrder: coerceSortOrder(raw.sortOrder, index),
      };
    })
    .filter((row): row is NormalizedPropertyImage => row !== null);
}

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

function parseOptionalNonNegativeInt(raw: string | undefined): number | undefined {
  if (!raw?.trim()) return undefined;
  const parsed = parseInt(raw.trim(), 10);
  if (Number.isNaN(parsed) || parsed < 0) return undefined;
  return parsed;
}

function parseOptionalPositiveFloat(raw: string | undefined): number | undefined {
  if (!raw?.trim()) return undefined;
  const parsed = parseFloat(raw.trim());
  if (Number.isNaN(parsed) || parsed <= 0) return undefined;
  return parsed;
}

export async function generatePropertyContentAction(
  _prevState: GeneratePropertyContentState,
  formData: FormData
): Promise<GeneratePropertyContentState> {
  const prompt = (formData.get("aiPrompt") as string)?.trim() ?? "";
  const type = (formData.get("type") as string)?.trim() || undefined;
  const city = (formData.get("city") as string)?.trim() || undefined;
  const state = (formData.get("state") as string)?.trim() || undefined;
  const neighborhood = (formData.get("neighborhood") as string)?.trim() || undefined;
  const builderName = (formData.get("builderName") as string)?.trim() || undefined;
  const bedrooms = parseOptionalNonNegativeInt(
    (formData.get("bedrooms") as string)?.trim()
  );
  const bathrooms = parseOptionalNonNegativeInt(
    (formData.get("bathrooms") as string)?.trim()
  );
  const garage = parseOptionalNonNegativeInt((formData.get("garage") as string)?.trim());
  const areaMin = parseOptionalPositiveFloat(
    (formData.get("areaMin") as string)?.trim()
  );
  const areaMax = parseOptionalPositiveFloat(
    (formData.get("areaMax") as string)?.trim()
  );
  const priceStr = (formData.get("price") as string)?.trim();
  const price = priceStr ? Number(priceStr) : undefined;
  const area = areaMin ?? areaMax;

  try {
    const result = await generatePropertyContent({
      prompt,
      context: {
        type,
        typeLabel: formatPropertyTypeLabel(type),
        city,
        state,
        neighborhood,
        bedrooms,
        bathrooms,
        garage,
        area,
        areaMin,
        areaMax,
        price:
          price != null && !Number.isNaN(price) && price > 0 ? price : undefined,
        builderName,
      },
    });
    return { title: result.title, description: result.description };
  } catch {
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
  const neighborhoodRaw = (formData.get("neighborhood") as string)?.trim() || null;
  const street = (formData.get("street") as string)?.trim() || null;
  const streetNumber = (formData.get("streetNumber") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim();
  const countryRaw = (formData.get("country") as string)?.trim() || null;
  const country = countryRaw && countryRaw.length > 0 ? countryRaw : null;
  const postalParsed = parseOptionalPostalCode(
    formData.get("postalCode") as string | undefined
  );
  const typeStr = (formData.get("type") as string)?.trim();
  const bedrooms = parseInt((formData.get("bedrooms") as string) || "0", 10);
  const bathrooms = parseInt((formData.get("bathrooms") as string) || "0", 10);
  const garage = parseInt((formData.get("garage") as string) || "0", 10);
  const areaMinStr = (formData.get("areaMin") as string) ?? "";
  const areaMaxStr = (formData.get("areaMax") as string) ?? "";
  const imagesDataStr = (formData.get("imagesData") as string)?.trim();
  const imagesData = parseImagesData(imagesDataStr);
  const status = (formData.get("status") as string)?.trim();
  const ownerName = (formData.get("ownerName") as string)?.trim() || null;
  const ownerPhone = (formData.get("ownerPhone") as string)?.trim() || null;
  const builderNameRaw = (formData.get("builderName") as string)?.trim() || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const isLaunch = formData.get("isLaunch") === "on";
  const isOpportunity = formData.get("isOpportunity") === "on";
  const youtubeVideoId = parseYouTubeVideoId(formData.get("youtubeVideoId") as string);

  if (!title) errors.title = "Título é obrigatório";
  if (slugInput && !/^[a-z0-9-]+$/.test(slugInput)) {
    errors.slug = "Slug deve conter apenas letras minúsculas, números e hífens";
  }
  const priceValidation = validatePropertyPriceFormInput(priceStr ?? "");
  if (!priceValidation.ok) {
    errors.price = priceValidation.error;
  }
  if (!city) errors.city = "Cidade é obrigatória";
  if (!state) errors.state = "Estado é obrigatório";
  if (postalParsed.error) errors.postalCode = postalParsed.error;
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
  const areaValidation = parsePropertyAreaFormInput(areaMinStr, areaMaxStr);
  if (!areaValidation.ok) {
    Object.assign(errors, areaValidation.errors);
  }
  if (imagesData.length > PROPERTY_GALLERY_MAX_IMAGES) {
    errors.images = `Máximo de ${PROPERTY_GALLERY_MAX_IMAGES} fotos por imóvel. Remova imagens antes de salvar.`;
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  if (!priceValidation.ok) {
    return { errors: { price: priceValidation.error } };
  }

  const price = priceValidation.price;
  if (!areaValidation.ok) {
    return { errors: areaValidation.errors };
  }
  const { area, areaMin, areaMax } = areaValidation;
  const propertyType = typeStr as PropertyType;
  const propertyTypeSlug = PROPERTY_TYPE_TO_SLUG[propertyType];
  const isSold = status === "VENDIDO";
  const postalCode = postalParsed.value;

  const resolvedCity = await resolveCityForProperty({ city, state });
  const citySlug = resolvedCity.citySlug;
  const resolvedNeighborhood = await resolveNeighborhoodForProperty({
    neighborhood: neighborhoodRaw,
    city: resolvedCity.city,
    state: resolvedCity.state,
  });
  const neighborhood = resolvedNeighborhood.neighborhood;
  const neighborhoodSlug = resolvedNeighborhood.neighborhoodSlug;

  const resolvedBuilder = await resolveBuilderForProperty({
    builderName: builderNameRaw,
  });
  const builderName = resolvedBuilder.builderName;
  const builderSlug = resolvedBuilder.builderSlug;

  const baseSlug =
    slugInput ||
    (slugify(title) || `imovel-${propertyTypeSlug}-${citySlug}-${Date.now().toString(36)}`);
  const slug = await ensureUniqueSlug(baseSlug);

  const validImages = normalizePropertyImagesForDb(imagesData);
  const visibleImages = validImages
    .filter((i) => !i.isHidden)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImage =
    validImages.find((i) => i.isPrimary) ?? visibleImages[0];
  const featuredImage = primaryImage?.url || null;
  const featuredImageAlt = primaryImage?.alt ?? null;
  const galleryImages = visibleImages.map((i) => i.url);

  const property = await createPropertyWithOptionalSchema({
    slug,
    title,
    description,
    transactionType: "SALE",
    price,
    city: resolvedCity.city,
    neighborhood,
    street,
    streetNumber,
    state: resolvedCity.state,
    country,
    postalCode,
    citySlug,
    neighborhoodSlug,
    stateSlug: resolvedCity.stateSlug,
    propertyTypeSlug,
    type: propertyType,
    bedrooms: bedrooms || 0,
    bathrooms: bathrooms || 0,
    garage: garage || 0,
    area,
    areaMin,
    areaMax,
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
    builderName,
    builderSlug,
    youtubeVideoId,
  });

  for (let i = 0; i < validImages.length; i++) {
    const img = validImages[i];
    await prisma.propertyImage.create({
      data: {
        propertyId: property.id,
        url: img.url,
        alt: img.alt,
        environment: img.environment,
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
  revalidatePropertyDetailBySlug(existing.slug);
  await revalidateBlogPagesReferencingProperty(propertyId);
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
  revalidatePropertyDetailBySlug(existing.slug);
  await revalidateBlogPagesReferencingProperty(propertyId);
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
  revalidatePropertyDetailBySlug(existing.slug);
  await revalidateBlogPagesReferencingProperty(propertyId);
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
  const neighborhoodRaw = (formData.get("neighborhood") as string)?.trim() || null;
  const street = (formData.get("street") as string)?.trim() || null;
  const streetNumber = (formData.get("streetNumber") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim();
  const countryRaw = (formData.get("country") as string)?.trim() || null;
  const country = countryRaw && countryRaw.length > 0 ? countryRaw : null;
  const postalParsed = parseOptionalPostalCode(
    formData.get("postalCode") as string | undefined
  );
  const typeStr = (formData.get("type") as string)?.trim();
  const bedrooms = parseInt((formData.get("bedrooms") as string) || "0", 10);
  const bathrooms = parseInt((formData.get("bathrooms") as string) || "0", 10);
  const garage = parseInt((formData.get("garage") as string) || "0", 10);
  const areaMinStr = (formData.get("areaMin") as string) ?? "";
  const areaMaxStr = (formData.get("areaMax") as string) ?? "";
  const imagesDataStr = (formData.get("imagesData") as string)?.trim();
  const imagesData = parseImagesData(imagesDataStr);
  const status = (formData.get("status") as string)?.trim();
  const ownerName = (formData.get("ownerName") as string)?.trim() || null;
  const ownerPhone = (formData.get("ownerPhone") as string)?.trim() || null;
  const builderNameRaw = (formData.get("builderName") as string)?.trim() || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const isLaunch = formData.get("isLaunch") === "on";
  const isOpportunity = formData.get("isOpportunity") === "on";
  const youtubeVideoId = parseYouTubeVideoId(formData.get("youtubeVideoId") as string);

  if (!title) errors.title = "Título é obrigatório";
  if (slugInput && !/^[a-z0-9-]+$/.test(slugInput)) {
    errors.slug = "Slug deve conter apenas letras minúsculas, números e hífens";
  }
  const priceValidation = validatePropertyPriceFormInput(priceStr ?? "");
  if (!priceValidation.ok) {
    errors.price = priceValidation.error;
  }
  if (!city) errors.city = "Cidade é obrigatória";
  if (!state) errors.state = "Estado é obrigatório";
  if (postalParsed.error) errors.postalCode = postalParsed.error;
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
  const areaValidation = parsePropertyAreaFormInput(areaMinStr, areaMaxStr);
  if (!areaValidation.ok) {
    Object.assign(errors, areaValidation.errors);
  }
  if (imagesData.length > PROPERTY_GALLERY_MAX_IMAGES) {
    errors.images = `Máximo de ${PROPERTY_GALLERY_MAX_IMAGES} fotos por imóvel. Remova imagens antes de salvar.`;
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

  if (!priceValidation.ok) {
    return { errors: { price: priceValidation.error } };
  }

  const price = priceValidation.price;
  if (!areaValidation.ok) {
    return { errors: areaValidation.errors };
  }
  const { area, areaMin, areaMax } = areaValidation;
  const propertyType = typeStr as PropertyType;
  const propertyTypeSlug = PROPERTY_TYPE_TO_SLUG[propertyType];
  const isSold = status === "VENDIDO";
  const postalCode = postalParsed.value;

  const resolvedCity = await resolveCityForProperty({ city, state });
  const citySlug = resolvedCity.citySlug;
  const resolvedNeighborhood = await resolveNeighborhoodForProperty({
    neighborhood: neighborhoodRaw,
    city: resolvedCity.city,
    state: resolvedCity.state,
  });
  const neighborhood = resolvedNeighborhood.neighborhood;
  const neighborhoodSlug = resolvedNeighborhood.neighborhoodSlug;

  const resolvedBuilder = await resolveBuilderForProperty({
    builderName: builderNameRaw,
  });
  const builderName = resolvedBuilder.builderName;
  const builderSlug = resolvedBuilder.builderSlug;

  const baseSlug =
    slugInput ||
    (slugify(title) || `imovel-${propertyTypeSlug}-${citySlug}-${Date.now().toString(36)}`);
  const slug =
    baseSlug === existing.slug
      ? existing.slug
      : await ensureUniqueSlugForEdit(baseSlug, propertyId);

  const validImages = normalizePropertyImagesForDb(imagesData);
  const visibleImages = validImages
    .filter((i) => !i.isHidden)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImage =
    validImages.find((i) => i.isPrimary) ?? visibleImages[0];
  const featuredImage = primaryImage?.url || null;
  const featuredImageAlt = primaryImage?.alt ?? null;
  const galleryImages = visibleImages.map((i) => i.url);

  const updateData = {
    slug,
    title,
    description,
    price,
    city: resolvedCity.city,
    neighborhood,
    street,
    streetNumber,
    state: resolvedCity.state,
    country,
    postalCode,
    citySlug,
    neighborhoodSlug,
    stateSlug: resolvedCity.stateSlug,
    propertyTypeSlug,
    type: propertyType,
    bedrooms: bedrooms || 0,
    bathrooms: bathrooms || 0,
    garage: garage || 0,
    area,
    areaMin,
    areaMax,
    featuredImage,
    featuredImageAlt,
    galleryImages,
    isSold,
    isFeatured,
    isLaunch,
    isOpportunity,
    ownerName,
    ownerPhone,
    builderName,
    builderSlug,
    youtubeVideoId,
  };

  const persistedUpdateData = await preparePropertyPersistData(updateData);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: propertyId },
        data: persistedUpdateData,
      });

      await tx.propertyImage.deleteMany({ where: { propertyId } });

      for (let i = 0; i < validImages.length; i++) {
        const img = validImages[i];
        await tx.propertyImage.create({
          data: {
            propertyId,
            url: img.url,
            alt: img.alt,
            environment: img.environment,
            isPrimary: img.isPrimary,
            isHidden: img.isHidden,
            sortOrder: i,
          },
        });
      }
    });
  } catch (err) {
    if (isPendingSchemaMigrationError(err)) {
      resetSchemaMigrationCache();
      return {
        errors: {
          _form:
            "O banco de dados está desatualizado (migration de construtoras incompleta). Aplique o SQL no Supabase e reinicie o servidor de desenvolvimento.",
        },
      };
    }
    throw err;
  }

  revalidatePath("/admin/imoveis");
  revalidatePath(`/admin/imoveis/${propertyId}/editar`);
  revalidatePath("/imoveis");
  revalidatePath(`/imoveis/${slug}`);
  revalidatePropertyDetailBySlug(existing.slug);
  if (slug !== existing.slug) {
    revalidatePropertyDetailBySlug(slug);
  }
  await revalidateBlogPagesReferencingProperty(propertyId);
  redirect("/admin/imoveis");
}
