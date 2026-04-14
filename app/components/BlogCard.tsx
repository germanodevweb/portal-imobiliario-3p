import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import {
  coerceBlogPostDate,
  getBlogCoverImageProps,
} from "@/lib/utils/blog-image";

type BlogCardProps = {
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | string | null;
  type: string | null;
};

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function BlogCard({
  title,
  slug,
  excerpt,
  featuredImage,
  publishedAt,
  type,
}: BlogCardProps) {
  const published = coerceBlogPostDate(publishedAt);
  const dateTimeAttr = published?.toISOString();
  const cover = featuredImage ? getBlogCoverImageProps(featuredImage) : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/blog/${slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Ler artigo: {title}</span>
      </Link>

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
        {cover?.src ? (
          <Image
            src={cover.src}
            alt={title}
            fill
            unoptimized={cover.unoptimized}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-200">
            <span className="text-zinc-400">Sem imagem</span>
          </div>
        )}
        
        {type && (
          <div className="absolute left-4 top-4 z-20">
            <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-green-800 shadow-sm backdrop-blur-sm">
              {type === "ARTIGO" ? "Artigo" : 
               type === "GUIA" ? "Guia" : 
               type === "NOTICIA" ? "Notícia" : 
               type === "INVESTIMENTO" ? "Investimento" : type}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center text-xs text-zinc-500">
          <CalendarDays className="mr-1.5 h-4 w-4" aria-hidden />
          <time dateTime={dateTimeAttr}>{formatDate(published)}</time>
        </div>

        <h3 className="mb-2 text-xl font-bold leading-tight text-zinc-900 group-hover:text-green-700">
          {title}
        </h3>

        {excerpt && (
          <p className="mb-6 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center text-sm font-semibold text-green-700">
          Ler artigo
          <span className="ml-1 transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </article>
  );
}
