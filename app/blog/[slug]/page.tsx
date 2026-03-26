import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { getPostBySlug, getRecentPosts, getPublishedPostSlugsForSitemap } from "@/lib/queries/blog";
import {
  buildBlogPostTitle,
  buildBlogPostDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  getPropertyTypeLabel,
  SITE_NAME,
  BASE_URL,
} from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

// ---------------------------------------------------------------------------
// SSG: pré-gera rotas para todos os posts publicados
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugsForSitemap();
  return slugs.map((p) => ({ slug: p.slug }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Transforma um slug em label legível para exibição.
 * "sao-paulo" → "São Paulo" (sem acentuação perfeita, mas legível).
 * Para tipos, usa getPropertyTypeLabel que tem o mapeamento correto.
 */
function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Extrai links transacionais a partir das tags do post.
 * Cada tag segue a convenção "entidade:slug".
 * Retorna array de { href, label } para renderizar na sidebar.
 */
function buildTagLinks(tags: string[]): { href: string; label: string }[] {
  const links: { href: string; label: string }[] = [];

  for (const tag of tags) {
    if (tag.startsWith("tipo:")) {
      const typeSlug = tag.replace("tipo:", "");
      links.push({
        href: `/tipo/${typeSlug}`,
        label: getPropertyTypeLabel(typeSlug),
      });
    } else if (tag.startsWith("cidade:")) {
      const citySlug = tag.replace("cidade:", "");
      links.push({
        href: `/cidade/${citySlug}`,
        label: `Imóveis em ${slugToLabel(citySlug)}`,
      });
    } else if (tag.startsWith("bairro:")) {
      const bairroSlug = tag.replace("bairro:", "");
      links.push({
        href: `/bairro/${bairroSlug}`,
        label: `Bairro ${slugToLabel(bairroSlug)}`,
      });
    }
  }

  return links;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post não encontrado | 3Pinheiros" };
  }

  const title = post.metaTitle ?? buildBlogPostTitle(post.title);
  const description = buildBlogPostDescription(post.title, post.metaDescription ?? post.excerpt);
  const canonical = buildCanonicalUrl(`/blog/${slug}`);
  const image = post.ogImage ?? post.featuredImage ?? undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: buildOpenGraph({ title, description, url: canonical, image }),
    twitter: buildTwitterCard({ title, description, image }),
    robots: { index: true, follow: true },
  };
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, recentPosts] = await Promise.all([
    getPostBySlug(slug),
    getRecentPosts(3, slug),
  ]);

  if (!post) notFound();

  const canonical = buildCanonicalUrl(`/blog/${slug}`);
  const dateLabel = formatDate(post.publishedAt);
  const dateIso = post.publishedAt?.toISOString() ?? post.updatedAt.toISOString();

  // Links contextuais derivados das tags do post
  const tagLinks = buildTagLinks(post.tags);

  // -------------------------------------------------------------------------
  // JSON-LD
  // -------------------------------------------------------------------------

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: buildCanonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: buildCanonicalUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? buildBlogPostDescription(post.title, post.excerpt),
    url: canonical,
    datePublished: dateIso,
    dateModified: post.updatedAt.toISOString(),
    ...(post.featuredImage ? { image: post.featuredImage } : {}),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
  };

  return (
    <>
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Breadcrumb visível */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500"
        >
          <Link href="/" className="transition-colors hover:text-green-700">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" className="transition-colors hover:text-green-700">
            Blog
          </Link>
          <span aria-hidden="true">/</span>
          <span className="line-clamp-1 font-medium text-zinc-800">{post.title}</span>
        </nav>

        {/* Cabeçalho do artigo */}
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-700">
            Blog
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-zinc-500">
              {post.excerpt}
            </p>
          )}
          {dateLabel && (
            <p className="mt-4 text-xs text-zinc-400">
              Publicado em{" "}
              <time dateTime={dateIso}>{dateLabel}</time>
              {" "}&mdash;{" "}
              <span>{SITE_NAME}</span>
            </p>
          )}
        </header>

        {/* Imagem de destaque */}
        {post.featuredImage && (
          <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        )}

        <div className="lg:grid lg:grid-cols-3 lg:gap-12">

          {/* Conteúdo principal */}
          <article className="lg:col-span-2">
            <div
              className="prose-sm max-w-none text-zinc-700 [&>h2]:mb-3 [&>h2]:mt-8 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-zinc-900 [&>h3]:mb-2 [&>h3]:mt-6 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-zinc-800 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>li]:mb-1 [&>a]:text-green-700 [&>a]:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Bloco de CTA editorial */}
            <section
              className="mt-12 rounded-xl bg-green-50 p-6 sm:p-8"
              aria-label="Consultoria 3Pinheiros"
            >
              <h2 className="text-lg font-semibold text-zinc-900">
                Precisa de ajuda para encontrar o imóvel certo?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                A 3Pinheiros acompanha todo o processo: busca, negociação,
                financiamento e assessoria jurídica até a entrega das chaves.
                Atendimento presencial e remoto. CRECI 1317J.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/contato"
                  className="inline-flex items-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
                >
                  Falar com um consultor
                </Link>
                <Link
                  href="/imoveis"
                  className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                >
                  Ver imóveis disponíveis
                </Link>
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="mt-12 flex flex-col gap-6 lg:mt-0">

            {/* Links contextuais baseados nas tags do post — silo blog → transacional */}
            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Explorar imóveis
              </p>
              <ul className="flex flex-col gap-2 text-sm">
                {/* Links dinâmicos derivados das tags do post */}
                {tagLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-zinc-700 transition-colors hover:text-green-700"
                    >
                      <span className="text-green-600" aria-hidden="true">&#8594;</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
                {/* Fallbacks sempre presentes */}
                <li>
                  <Link
                    href="/imoveis"
                    className="flex items-center gap-2 text-zinc-700 transition-colors hover:text-green-700"
                  >
                    <span className="text-green-600" aria-hidden="true">&#8594;</span>
                    Todos os imóveis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contato"
                    className="flex items-center gap-2 text-zinc-700 transition-colors hover:text-green-700"
                  >
                    <span className="text-green-600" aria-hidden="true">&#8594;</span>
                    Falar com consultor
                  </Link>
                </li>
              </ul>
            </div>

            {/* Posts recentes */}
            {recentPosts.length > 0 && (
              <div className="rounded-xl border border-zinc-100 bg-white p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Leia também
                </p>
                <ul className="flex flex-col gap-4">
                  {recentPosts.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="group flex flex-col gap-1"
                      >
                        {p.featuredImage && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-100">
                            <Image
                              src={p.featuredImage}
                              alt={p.title}
                              fill
                              sizes="200px"
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium text-zinc-800 transition-colors group-hover:text-green-700">
                          {p.title}
                        </span>
                        {p.publishedAt && (
                          <span className="text-xs text-zinc-400">
                            {formatDate(p.publishedAt)}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-zinc-100 pt-4">
                  <Link
                    href="/blog"
                    className="text-sm font-medium text-green-700 underline-offset-2 hover:underline"
                  >
                    Ver todos os artigos →
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
