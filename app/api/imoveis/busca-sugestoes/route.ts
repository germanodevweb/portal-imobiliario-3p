import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildPublishedPropertyTextSearchWhere,
  isValidPropertySearchQuery,
  sanitizePropertySearchQuery,
} from "@/lib/imoveis/property-text-search";

export type PropertySearchSuggestion = {
  label: string;
  hint: string;
  href: string;
};

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const query = sanitizePropertySearchQuery(url.searchParams.get("q") ?? "");

  if (!isValidPropertySearchQuery(query)) {
    return NextResponse.json({ suggestions: [] satisfies PropertySearchSuggestion[] });
  }

  const textWhere = buildPublishedPropertyTextSearchWhere(query);
  if (!textWhere) {
    return NextResponse.json({ suggestions: [] satisfies PropertySearchSuggestion[] });
  }

  const publishedWithText = { published: true, AND: [textWhere] };

  const [cityRows, neighborhoodRows, properties] = await Promise.all([
    prisma.property.findMany({
      where: {
        ...publishedWithText,
        city: { contains: query, mode: "insensitive" },
      },
      distinct: ["citySlug"],
      select: { city: true, citySlug: true },
      take: 3,
      orderBy: { city: "asc" },
    }),
    prisma.property.findMany({
      where: {
        ...publishedWithText,
        neighborhood: { contains: query, mode: "insensitive" },
        neighborhoodSlug: { not: null },
      },
      distinct: ["neighborhoodSlug"],
      select: {
        neighborhood: true,
        neighborhoodSlug: true,
        city: true,
        citySlug: true,
      },
      take: 3,
      orderBy: { neighborhood: "asc" },
    }),
    prisma.property.findMany({
      where: publishedWithText,
      select: {
        slug: true,
        title: true,
        city: true,
        neighborhood: true,
        builderName: true,
      },
      take: 5,
      orderBy: [
        { isLaunch: "desc" },
        { publishedAt: { sort: "desc", nulls: "first" } },
        { createdAt: "desc" },
      ],
    }),
  ]);

  const suggestions: PropertySearchSuggestion[] = [];
  const seen = new Set<string>();

  const push = (item: PropertySearchSuggestion) => {
    if (seen.has(item.href)) return;
    seen.add(item.href);
    suggestions.push(item);
  };

  for (const row of cityRows) {
    push({
      label: row.city,
      hint: "Cidade",
      href: `/imoveis?cidade=${encodeURIComponent(row.citySlug)}`,
    });
  }

  for (const row of neighborhoodRows) {
    if (!row.neighborhood || !row.neighborhoodSlug) continue;
    push({
      label: row.neighborhood,
      hint: row.city,
      href: `/imoveis?cidade=${encodeURIComponent(row.citySlug)}&bairro=${encodeURIComponent(row.neighborhoodSlug)}`,
    });
  }

  for (const row of properties) {
    const hintParts = [
      row.city,
      row.neighborhood,
      row.builderName ? `Construtora: ${row.builderName}` : null,
    ].filter((part): part is string => Boolean(part));

    push({
      label: row.title,
      hint: hintParts.join(" · "),
      href: `/imoveis/${encodeURIComponent(row.slug)}`,
    });
  }

  return NextResponse.json({
    suggestions: suggestions.slice(0, 8),
  });
}
