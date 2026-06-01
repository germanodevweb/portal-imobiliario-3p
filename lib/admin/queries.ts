// ---------------------------------------------------------------------------
// Queries administrativas — acesso a todos os dados, sem filtro published.
// Separado de lib/queries/properties para não misturar lógica pública e admin.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import type { PropertyType } from "@/lib/generated/prisma/client";
import {
  hasPropertyAreaRangeColumns,
  hasPropertyBuilderColumns,
  isPendingSchemaMigrationError,
  resetSchemaMigrationCache,
} from "@/lib/admin/schema-migration";

export type AdminPropertyListItem = {
  id: string;
  slug: string;
  title: string;
  price: string;
  city: string;
  citySlug: string;
  neighborhood: string | null;
  neighborhoodSlug: string | null;
  builderName: string | null;
  featuredImage: string | null;
  /** URL para miniatura na lista: `featuredImage` ou primeira linha de `PropertyImage`. */
  listThumbnailUrl: string | null;
  isFeatured: boolean;
  isLaunch: boolean;
  isOpportunity: boolean;
  published: boolean;
  updatedAt: Date;
};

const adminListSelectBase = {
  id: true,
  slug: true,
  title: true,
  price: true,
  city: true,
  citySlug: true,
  neighborhood: true,
  neighborhoodSlug: true,
  featuredImage: true,
  isFeatured: true,
  isLaunch: true,
  isOpportunity: true,
  published: true,
  updatedAt: true,
} as const;

const adminListSelectWithBuilder = {
  ...adminListSelectBase,
  builderName: true,
} as const;

type AdminPropertyRow = {
  id: string;
  slug: string;
  title: string;
  price: unknown;
  city: string;
  citySlug: string;
  neighborhood: string | null;
  neighborhoodSlug: string | null;
  builderName?: string | null;
  featuredImage: string | null;
  isFeatured: boolean;
  isLaunch: boolean;
  isOpportunity: boolean;
  published: boolean;
  updatedAt: Date;
  images: { url: string }[];
};

async function fetchAdminProperties(
  includeBuilder: boolean
): Promise<AdminPropertyListItem[]> {
  const results = (await prisma.property.findMany({
    select: {
      ...(includeBuilder ? adminListSelectWithBuilder : adminListSelectBase),
      images: {
        take: 1,
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { url: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })) as AdminPropertyRow[];

  return results.map((p) => {
    const { images, ...rest } = p;
    const listThumbnailUrl = rest.featuredImage ?? images[0]?.url ?? null;
    return {
      ...rest,
      builderName: includeBuilder ? (rest.builderName ?? null) : null,
      price: String(rest.price),
      listThumbnailUrl,
    };
  });
}

/**
 * Lista todos os imóveis para o painel administrativo.
 * Ordena por updatedAt descendente (mais recentes primeiro).
 * Se a migration de construtora ainda não foi aplicada, lista sem builderName.
 */
export async function getAdminProperties(): Promise<AdminPropertyListItem[]> {
  const includeBuilder = await hasPropertyBuilderColumns();
  return fetchAdminProperties(includeBuilder);
}

const propertyEditSelectBase = {
  id: true,
  title: true,
  slug: true,
  description: true,
  price: true,
  city: true,
  neighborhood: true,
  street: true,
  streetNumber: true,
  state: true,
  country: true,
  postalCode: true,
  type: true,
  bedrooms: true,
  bathrooms: true,
  garage: true,
  area: true,
  isSold: true,
  isFeatured: true,
  isLaunch: true,
  isOpportunity: true,
  ownerName: true,
  ownerPhone: true,
  youtubeVideoId: true,
  featuredImage: true,
  featuredImageAlt: true,
  galleryImages: true,
} as const;

const propertyEditSelectWithBuilder = {
  ...propertyEditSelectBase,
  builderName: true,
} as const;

const propertyEditSelectWithAreaRange = {
  ...propertyEditSelectBase,
  areaMin: true,
  areaMax: true,
} as const;

const propertyEditSelectWithBuilderAndAreaRange = {
  ...propertyEditSelectWithBuilder,
  areaMin: true,
  areaMax: true,
} as const;

const propertyEditImagesSelect = {
  orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
  select: {
    url: true,
    alt: true,
    environment: true,
    isPrimary: true,
    isHidden: true,
    sortOrder: true,
  },
};

export type AdminPropertyForEdit = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: unknown;
  city: string;
  neighborhood: string | null;
  street: string | null;
  streetNumber: string | null;
  state: string;
  country: string | null;
  postalCode: string | null;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  area: number | null;
  areaMin: number | null;
  areaMax: number | null;
  isSold: boolean;
  isFeatured: boolean;
  isLaunch: boolean;
  isOpportunity: boolean;
  ownerName: string | null;
  ownerPhone: string | null;
  builderName: string | null;
  youtubeVideoId: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  galleryImages: string[];
  images: {
    url: string;
    alt: string | null;
    environment: string | null;
    isPrimary: boolean;
    isHidden: boolean;
    sortOrder: number;
  }[];
};

async function fetchAdminPropertyForEdit(
  id: string,
  includeBuilder: boolean,
  includeAreaRange: boolean
): Promise<AdminPropertyForEdit | null> {
  const select =
    includeBuilder && includeAreaRange
      ? propertyEditSelectWithBuilderAndAreaRange
      : includeBuilder
        ? propertyEditSelectWithBuilder
        : includeAreaRange
          ? propertyEditSelectWithAreaRange
          : propertyEditSelectBase;

  const row = await prisma.property.findUnique({
    where: { id },
    select: {
      ...select,
      images: propertyEditImagesSelect,
    },
  });

  if (!row) return null;

  const builderName = includeBuilder
    ? ("builderName" in row ? (row.builderName as string | null) : null)
    : null;

  const areaMin = includeAreaRange
    ? ("areaMin" in row ? (row.areaMin as number | null) : null)
    : null;
  const areaMax = includeAreaRange
    ? ("areaMax" in row ? (row.areaMax as number | null) : null)
    : null;

  return {
    ...row,
    builderName,
    areaMin,
    areaMax,
  };
}

/**
 * Busca imóvel para edição no admin.
 * Se a migration de construtora ainda não foi aplicada, retorna sem builderName.
 */
export async function getAdminPropertyForEdit(id: string): Promise<AdminPropertyForEdit | null> {
  const trimmedId = id.trim();
  if (!trimmedId) return null;

  let includeBuilder = await hasPropertyBuilderColumns();
  let includeAreaRange = await hasPropertyAreaRangeColumns();

  try {
    return await fetchAdminPropertyForEdit(trimmedId, includeBuilder, includeAreaRange);
  } catch (err) {
    if (isPendingSchemaMigrationError(err)) {
      resetSchemaMigrationCache();
      includeBuilder = await hasPropertyBuilderColumns();
      includeAreaRange = await hasPropertyAreaRangeColumns();
      return fetchAdminPropertyForEdit(trimmedId, includeBuilder, includeAreaRange);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Leads — listagem administrativa
// ---------------------------------------------------------------------------

export type AdminLeadListItem = {
  id: string;
  name: string;
  phone: string;
  desiredPriceRange: string | null;
  origin: "site" | "manual";
  manualSource: string | null;
  status: "novo" | "em_contato" | "qualificado" | "vendido" | "perdido";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Lista todos os leads para o painel administrativo.
 * Ordena por createdAt descendente (mais recentes primeiro).
 */
export async function getAdminLeads(): Promise<AdminLeadListItem[]> {
  const results = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });
  return results;
}
