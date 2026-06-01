import { prisma } from "@/lib/prisma";
import {
  hasBuilderContactColumns,
  hasBuilderTable,
  hasPropertyBuilderColumns,
} from "@/lib/admin/schema-migration";

export type RegisteredBuilderOption = {
  id: string;
  name: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

export type AdminBuilderPropertySummary = {
  id: string;
  title: string;
  price: string;
  published: boolean;
  isFeatured: boolean;
  isLaunch: boolean;
  isOpportunity: boolean;
};

export type AdminBuilderListItem = {
  id: string;
  name: string;
  slug: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  propertyCount: number;
  updatedAt: Date;
  properties: AdminBuilderPropertySummary[];
};

const builderListSelectBase = {
  id: true,
  name: true,
  slug: true,
  updatedAt: true,
} as const;

const builderListSelectWithContact = {
  ...builderListSelectBase,
  contactName: true,
  contactPhone: true,
  contactEmail: true,
} as const;

type BuilderRowBase = {
  id: string;
  name: string;
  slug: string;
  updatedAt: Date;
};

type BuilderRowWithContact = BuilderRowBase & {
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

function mapBuilderContactFields(
  row: BuilderRowBase | BuilderRowWithContact,
  includeContact: boolean
): {
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
} {
  if (!includeContact || !("contactName" in row)) {
    return { contactName: null, contactPhone: null, contactEmail: null };
  }

  const withContact = row as BuilderRowWithContact;
  return {
    contactName: withContact.contactName,
    contactPhone: withContact.contactPhone,
    contactEmail: withContact.contactEmail,
  };
}

export async function getRegisteredBuilderOptions(): Promise<RegisteredBuilderOption[]> {
  if (!(await hasBuilderTable())) {
    return [];
  }

  const includeContact = await hasBuilderContactColumns();

  const rows = await prisma.builder.findMany({
    orderBy: { name: "asc" },
    select: includeContact
      ? builderListSelectWithContact
      : { ...builderListSelectBase },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    ...mapBuilderContactFields(row, includeContact),
  }));
}

async function fetchPropertiesByBuilderSlug(): Promise<
  Map<string, AdminBuilderPropertySummary[]>
> {
  const map = new Map<string, AdminBuilderPropertySummary[]>();

  if (!(await hasPropertyBuilderColumns())) {
    return map;
  }

  const rows = await prisma.property.findMany({
    where: { builderSlug: { not: null } },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      price: true,
      builderSlug: true,
      published: true,
      isFeatured: true,
      isLaunch: true,
      isOpportunity: true,
    },
  });

  for (const row of rows) {
    if (!row.builderSlug) continue;

    const item: AdminBuilderPropertySummary = {
      id: row.id,
      title: row.title,
      price: String(row.price),
      published: row.published,
      isFeatured: row.isFeatured,
      isLaunch: row.isLaunch,
      isOpportunity: row.isOpportunity,
    };

    const existing = map.get(row.builderSlug);
    if (existing) {
      existing.push(item);
    } else {
      map.set(row.builderSlug, [item]);
    }
  }

  return map;
}

export async function getAdminBuilders(): Promise<AdminBuilderListItem[]> {
  if (!(await hasBuilderTable())) {
    return [];
  }

  const includeContact = await hasBuilderContactColumns();

  const rows = await prisma.builder.findMany({
    orderBy: { name: "asc" },
    select: includeContact ? builderListSelectWithContact : builderListSelectBase,
  });

  const propertiesBySlug = await fetchPropertiesByBuilderSlug();

  return rows.map((row) => {
    const properties = propertiesBySlug.get(row.slug) ?? [];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      updatedAt: row.updatedAt,
      ...mapBuilderContactFields(row, includeContact),
      properties,
      propertyCount: properties.length,
    };
  });
}

export async function getAdminBuilderById(id: string) {
  if (!(await hasBuilderTable())) {
    return null;
  }

  const includeContact = await hasBuilderContactColumns();

  const row = await prisma.builder.findUnique({
    where: { id },
    select: includeContact ? builderListSelectWithContact : builderListSelectBase,
  });

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ...mapBuilderContactFields(row, includeContact),
  };
}
