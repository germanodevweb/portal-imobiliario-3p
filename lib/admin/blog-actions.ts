"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PostType, Post } from "@/lib/generated/prisma/client";
import { generateBlogContent } from "@/lib/ai/blog";

export type AdminPostListItem = {
  id: string;
  title: string;
  slug: string;
  type: PostType;
  citySlug: string | null;
  published: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
};

export async function getAdminPosts(): Promise<AdminPostListItem[]> {
  return prisma.post.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      citySlug: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAdminPostById(id: string): Promise<Post | null> {
  return prisma.post.findUnique({
    where: { id },
  });
}

export async function deletePostAction(id: string) {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function togglePostPublishAction(id: string, currentlyPublished: boolean) {
  await prisma.post.update({
    where: { id },
    data: { 
      published: !currentlyPublished,
      publishedAt: !currentlyPublished ? new Date() : null,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

type SavePostInput = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  type: PostType;
  citySlug?: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  published: boolean;
  relatedPropertyIds?: string[];
};

export async function savePostAction(input: SavePostInput) {
  const { id, ...data } = input;
  
  // Limpar slugs vazios para null para evitar strings vazias no DB
  const cleanData = {
    ...data,
    citySlug: data.citySlug?.trim() || null,
    metaTitle: data.metaTitle?.trim() || null,
    metaDescription: data.metaDescription?.trim() || null,
    featuredImage: data.featuredImage?.trim() || null,
    relatedPropertyIds: data.relatedPropertyIds || [],
  };

  let postId = id;

  if (id) {
    // Atualizar
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new Error("Post não encontrado.");

    const updateData: any = { ...cleanData };
    
    // Controlar publishedAt apenas se o status mudou de não publicado para publicado
    if (cleanData.published && !existing.published) {
      updateData.publishedAt = new Date();
    } else if (!cleanData.published) {
      updateData.publishedAt = null;
    }

    await prisma.post.update({
      where: { id },
      data: updateData,
    });
  } else {
    // Criar
    const created = await prisma.post.create({
      data: {
        ...cleanData,
        publishedAt: cleanData.published ? new Date() : null,
      },
    });
    postId = created.id;
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (data.slug) {
    revalidatePath(`/blog/${data.slug}`);
  }

  return { success: true, id: postId };
}

export async function generateBlogContentAction(theme: string) {
  if (!theme || !theme.trim()) {
    throw new Error("O tema é obrigatório.");
  }

  try {
    const result = await generateBlogContent({ theme });
    return { success: true, data: result };
  } catch (error) {
    console.error("[generateBlogContentAction] Erro:", error);
    throw new Error(error instanceof Error ? error.message : "Erro ao gerar artigo.");
  }
}

export type BlogPropertySearchResult = {
  id: string;
  title: string;
  city: string;
  price: number;
};

export async function searchPropertiesForBlog(query: string): Promise<BlogPropertySearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const properties = await prisma.property.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
      city: true,
      price: true,
    },
    take: 10,
    orderBy: {
      createdAt: 'desc',
    }
  });

  return properties.map(p => ({
    ...p,
    price: Number(p.price),
  }));
}

export async function getPropertiesByIdsForBlog(ids: string[]): Promise<BlogPropertySearchResult[]> {
  if (!ids || ids.length === 0) return [];
  const properties = await prisma.property.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      city: true,
      price: true,
    },
  });
  return properties.map(p => ({
    ...p,
    price: Number(p.price),
  }));
}

