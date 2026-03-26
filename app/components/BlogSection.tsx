import Link from "next/link";
import type { PostCardData } from "@/lib/queries/blog";

type BlogSectionProps = {
  posts: PostCardData[];
  heading?: string;
  description?: string;
};

/**
 * Seção de posts relacionados do blog para páginas transacionais.
 * Recebe posts já filtrados por tag (cidade, tipo ou bairro).
 * Retorna null se não houver posts, evitando seção vazia no HTML.
 * Server Component — sem estado cliente.
 */
export function BlogSection({
  posts,
  heading = "Do nosso blog",
  description = "Conteúdo e dicas sobre o mercado imobiliário.",
}: BlogSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-14" aria-label="Posts relacionados do blog">
      <h2 className="text-lg font-semibold text-zinc-900">{heading}</h2>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-zinc-100 bg-white p-5 transition-all hover:border-green-200 hover:bg-green-50"
            >
              <p className="line-clamp-2 text-sm font-semibold text-zinc-800 transition-colors group-hover:text-green-700">
                {post.title}
              </p>
              {post.excerpt && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                  {post.excerpt}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <Link
          href="/blog"
          className="text-sm font-medium text-green-700 underline-offset-2 hover:underline"
        >
          Ver todos os artigos →
        </Link>
      </div>
    </section>
  );
}
