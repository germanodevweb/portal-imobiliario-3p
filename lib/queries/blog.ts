import { prisma } from "@/lib/prisma";
import { Post } from "@/lib/generated/prisma/client";

export type PublicPostListItem = Pick<
  Post,
  "id" | "title" | "slug" | "excerpt" | "featuredImage" | "type" | "publishedAt" | "citySlug"
>;

/** Dados mínimos para cards do blog em páginas transacionais (`BlogSection`). */
export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
};

export type RecentPostSidebar = {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
};

export async function getPublicPosts(): Promise<PublicPostListItem[]> {
  return prisma.post.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      type: true,
      publishedAt: true,
      citySlug: true,
    },
    orderBy: { publishedAt: "desc" },
  });
}

/** Post publicado por slug (`findFirst`: slug é único, mas filtra `published`). */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  return prisma.post.findFirst({
    where: { slug, published: true },
  });
}

export async function getRecentPosts(
  limit: number,
  excludeSlug?: string
): Promise<RecentPostSidebar[]> {
  return prisma.post.findMany({
    where: {
      published: true,
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getPublishedPostSlugsForSitemap(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
}

/**
 * Posts com tag editorial (ex.: `cidade:balneario-camboriu`, `tipo:apartamento`).
 */
export async function getPostsByTag(tag: string, limit = 6): Promise<PostCardData[]> {
  return prisma.post.findMany({
    where: {
      published: true,
      tags: { has: tag },
    },
    select: {
      slug: true,
      title: true,
      excerpt: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getRelatedPropertiesForPost(propertyIds: string[]) {
  if (!propertyIds || propertyIds.length === 0) return [];

  return prisma.property.findMany({
    where: {
      id: { in: propertyIds },
      published: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      city: true,
      neighborhood: true,
      bedrooms: true,
      bathrooms: true,
      area: true,
      type: true,
      propertyTypeSlug: true,
      featuredImage: true,
      featuredImageAlt: true,
      transactionType: true,
    },
  });
}
