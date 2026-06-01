import { prisma } from "@/lib/prisma";
import { hasNeighborhoodTable } from "@/lib/admin/schema-migration";

export type AdminNeighborhoodListItem = {
  id: string;
  name: string;
  slug: string;
  city: string;
  citySlug: string;
  state: string;
  stateSlug: string;
  propertyCount: number;
  updatedAt: Date;
};

export type AdminNeighborhoodGroup = {
  city: string;
  state: string;
  citySlug: string;
  stateSlug: string;
  neighborhoods: AdminNeighborhoodListItem[];
};

export async function getAdminNeighborhoodGroups(): Promise<AdminNeighborhoodGroup[]> {
  if (!(await hasNeighborhoodTable())) {
    return [];
  }

  const rows = await prisma.neighborhood.findMany({
    orderBy: [{ city: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      citySlug: true,
      state: true,
      stateSlug: true,
      updatedAt: true,
    },
  });

  const counts = await prisma.property.groupBy({
    by: ["neighborhoodSlug", "citySlug", "stateSlug"],
    where: { neighborhoodSlug: { not: null } },
    _count: { _all: true },
  });

  const countMap = new Map<string, number>();
  for (const row of counts) {
    if (!row.neighborhoodSlug) continue;
    countMap.set(
      `${row.neighborhoodSlug}::${row.citySlug}::${row.stateSlug}`,
      row._count._all
    );
  }

  const items: AdminNeighborhoodListItem[] = rows.map((row) => ({
    ...row,
    propertyCount:
      countMap.get(`${row.slug}::${row.citySlug}::${row.stateSlug}`) ?? 0,
  }));

  const groupMap = new Map<string, AdminNeighborhoodGroup>();

  for (const item of items) {
    const key = `${item.citySlug}::${item.stateSlug}`;
    const existing = groupMap.get(key);
    if (existing) {
      existing.neighborhoods.push(item);
      continue;
    }

    groupMap.set(key, {
      city: item.city,
      state: item.state,
      citySlug: item.citySlug,
      stateSlug: item.stateSlug,
      neighborhoods: [item],
    });
  }

  return Array.from(groupMap.values()).sort((a, b) =>
    a.city.localeCompare(b.city, "pt-BR")
  );
}

export type RegisteredNeighborhoodOption = {
  id: string;
  name: string;
  citySlug: string;
  stateSlug: string;
};

export async function getRegisteredNeighborhoodOptions(): Promise<
  RegisteredNeighborhoodOption[]
> {
  if (!(await hasNeighborhoodTable())) {
    return [];
  }

  return prisma.neighborhood.findMany({
    orderBy: [{ city: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      citySlug: true,
      stateSlug: true,
    },
  });
}

export async function getAdminNeighborhoodById(id: string) {
  if (!(await hasNeighborhoodTable())) {
    return null;
  }

  return prisma.neighborhood.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      citySlug: true,
      state: true,
      stateSlug: true,
    },
  });
}
