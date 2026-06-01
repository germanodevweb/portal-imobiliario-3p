import { prisma } from "@/lib/prisma";
import { hasCityTable } from "@/lib/admin/schema-migration";

export type AdminCityListItem = {
  id: string;
  name: string;
  slug: string;
  state: string;
  stateSlug: string;
  propertyCount: number;
  updatedAt: Date;
};

export async function getAdminCities(): Promise<AdminCityListItem[]> {
  if (!(await hasCityTable())) {
    return [];
  }

  const rows = await prisma.city.findMany({
    orderBy: [{ state: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      state: true,
      stateSlug: true,
      updatedAt: true,
    },
  });

  const counts = await prisma.property.groupBy({
    by: ["citySlug", "stateSlug"],
    _count: { _all: true },
  });

  const countMap = new Map<string, number>();
  for (const row of counts) {
    countMap.set(`${row.citySlug}::${row.stateSlug}`, row._count._all);
  }

  return rows.map((row) => ({
    ...row,
    propertyCount: countMap.get(`${row.slug}::${row.stateSlug}`) ?? 0,
  }));
}

export type RegisteredCityOption = {
  id: string;
  name: string;
  state: string;
  slug: string;
  stateSlug: string;
};

export async function getRegisteredCityOptions(): Promise<RegisteredCityOption[]> {
  if (!(await hasCityTable())) {
    return [];
  }

  return prisma.city.findMany({
    orderBy: [{ state: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      state: true,
      slug: true,
      stateSlug: true,
    },
  });
}

export async function getAdminCityById(id: string) {
  if (!(await hasCityTable())) {
    return null;
  }

  return prisma.city.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      state: true,
      stateSlug: true,
    },
  });
}
