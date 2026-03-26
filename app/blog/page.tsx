import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { ServiceHero } from "@/app/components/ServiceHero";
import { getAllPublishedPosts } from "@/lib/queries/blog";
import {
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  SITE_NAME,
  BASE_URL,
} from "@/lib/seo";

// ---------------------------------------------------------------------------
// Metadata estática — título e canonical fixos para a listagem
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Inteligência e Análise do Mercado Imobiliário | ${SITE_NAME}`,
  description:
    "Análises setoriais, atualizações jurídicas e tendências do mercado imobiliário. Conteúdo estratégico para decisões informadas em compra, venda e investimento. 3Pinheiros CRECI 1317J.",
  alternates: { canonical: buildCanonicalUrl("/blog") },
  openGraph: buildOpenGraph({
    title: `Inteligência e Análise do Mercado Imobiliário | ${SITE_NAME}`,
    description:
      "Análises setoriais, atualizações jurídicas e tendências do mercado imobiliário. Conteúdo estratégico para decisões informadas.",
    url: buildCanonicalUrl("/blog"),
  }),
  twitter: buildTwitterCard({
    title: `Inteligência e Análise do Mercado Imobiliário | ${SITE_NAME}`,
    description:
      "Análises setoriais, atualizações jurídicas e tendências do mercado imobiliário. Conteúdo estratégico para decisões informadas.",
  }),
  robots: { index: true, follow: true },
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// ---------------------------------------------------------------------------
// Página — Server Component
// ---------------------------------------------------------------------------

export default async function BlogPage() {
  const posts = await getAllPublishedPosts();

  const canonical = buildCanonicalUrl("/blog");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: buildCanonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: canonical },
    ],
  };

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `Blog — ${SITE_NAME}`,
    url: canonical,
    description:
      "Dicas, guias e informações sobre o mercado imobiliário pela 3Pinheiros Consultoria Imobiliária.",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <main className="min-h-screen">
        <ServiceHero
          title="Inteligência e Análise do Mercado Imobiliário"
          subtitle="Análises setoriais, atualizações jurídicas e tendências de tecnologia aplicada ao imobiliário. Conteúdo estratégico para decisões informadas em compra, venda e investimento."
        />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Breadcrumb visível */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-2 text-sm text-zinc-500"
          >
            <Link href="/" className="transition-colors hover:text-green-700">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-zinc-800">Blog</span>
          </nav>

          {/* Grid de posts */}
        {posts.length === 0 ? (
          <p className="mt-12 text-sm text-zinc-500">
            Nenhum artigo publicado ainda. Em breve, novos conteúdos.
          </p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const dateLabel = formatDate(post.publishedAt);
              return (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white transition-all hover:border-green-200 hover:shadow-sm"
                  >
                    {/* Imagem de destaque */}
                    {post.featuredImage ? (
                      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-green-50" />
                    )}

                    {/* Conteúdo do card */}
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="line-clamp-2 text-base font-semibold text-zinc-900 transition-colors group-hover:text-green-700">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-500">
                          {post.excerpt}
                        </p>
                      )}
                      {dateLabel && (
                        <p className="mt-4 text-xs text-zinc-400">{dateLabel}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

          {/* CTA — reforça conversão a partir do tráfego informacional */}
          <section
            className="mt-16 rounded-xl bg-green-50 p-6 sm:p-8"
            aria-label="Consultoria 3Pinheiros"
          >
          <h2 className="text-lg font-semibold text-zinc-900">
            Pronto para dar o próximo passo?
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
            A 3Pinheiros acompanha você em todo o processo: busca, negociação,
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
        </div>
      </main>

      <Footer />
    </>
  );
}
