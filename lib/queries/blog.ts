import { cache } from "react";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type PostDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  // Tags de cluster SEO — convenção: "cidade:{slug}", "tipo:{slug}", "bairro:{slug}"
  tags: string[];
  publishedAt: Date | null;
  updatedAt: Date;
};

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Busca um post publicado pelo slug com todos os campos necessários para a página.
 * Inclui tags para o cluster SEO (links dinâmicos para páginas transacionais).
 * Envolto em React.cache para deduplicação entre generateMetadata e o componente.
 */
export const getPostBySlug = cache(async function (
  slug: string
): Promise<PostDetail | null> {
  return prisma.post.findUnique({
    where: { slug, published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      metaTitle: true,
      metaDescription: true,
      ogImage: true,
      tags: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
});

/**
 * Posts recentes publicados para exibir em sidebars ou seções relacionadas.
 * Usado em: páginas de post (seção "Leia também").
 */
export const getRecentPosts = cache(async function (
  limit = 4,
  excludeSlug?: string
): Promise<PostCardData[]> {
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
    orderBy: [
      { publishedAt: { sort: "desc", nulls: "first" } },
      { createdAt: "desc" },
    ],
    take: limit,
  });
});

/**
 * Posts publicados que possuem uma tag específica de cluster.
 * Usado em: seção "Do nosso blog" nas páginas transacionais.
 *
 * Convenção de tag:
 *   "cidade:sao-paulo"  → posts sobre imóveis em São Paulo
 *   "tipo:apartamento"  → posts sobre apartamentos
 *   "bairro:pinheiros"  → posts sobre o bairro Pinheiros
 */
export const getPostsByTag = cache(async function (
  tag: string,
  limit = 2
): Promise<PostCardData[]> {
  return prisma.post.findMany({
    where: { published: true, tags: { has: tag } },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
    },
    orderBy: [
      { publishedAt: { sort: "desc", nulls: "first" } },
      { createdAt: "desc" },
    ],
    take: limit,
  });
});

/**
 * Todos os posts publicados ordenados por data de publicação.
 * Usado em: app/blog/page.tsx (listagem do blog).
 */
export const getAllPublishedPosts = cache(async function (): Promise<PostCardData[]> {
  return prisma.post.findMany({
    where: { published: true },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
    },
    orderBy: [
      { publishedAt: { sort: "desc", nulls: "first" } },
      { createdAt: "desc" },
    ],
  });
});

/**
 * Slugs e datas de atualização de posts publicados.
 * Intencionalmente leve: sem conteúdo.
 * Usado em: sitemap.ts, generateStaticParams.
 */
export async function getPublishedPostSlugsForSitemap(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}
