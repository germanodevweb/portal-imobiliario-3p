import { Metadata } from "next";
import Link from "next/link";
import { getPublicPosts } from "@/lib/queries/blog";
import { BlogCard } from "@/app/components/BlogCard";
import { Header } from "@/app/components/Header";
import { ServiceHero } from "@/app/components/ServiceHero";
import { WhatsAppButton } from "@/app/components/WhatsAppButton";
import { Footer } from "@/app/components/Footer";
import {
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  SITE_NAME,
} from "@/lib/seo";

const blogTitle = `Blog | ${SITE_NAME}`;
const blogDescription =
  "Notícias, análises de mercado, guias e oportunidades de investimento imobiliário com a 3 Pinheiros.";

export const metadata: Metadata = {
  title: blogTitle,
  description: blogDescription,
  alternates: { canonical: buildCanonicalUrl("/blog") },
  openGraph: buildOpenGraph({
    title: blogTitle,
    description: blogDescription,
    url: buildCanonicalUrl("/blog"),
  }),
  twitter: buildTwitterCard({
    title: blogTitle,
    description: blogDescription,
  }),
  robots: { index: true, follow: true },
};

export const revalidate = 3600; // revalida de hora em hora

export default async function BlogIndexPage() {
  const posts = await getPublicPosts();

  return (
    <>
      <Header />

      <main className="flex-1 bg-zinc-50 pb-16">
        <div className="border-b border-zinc-100 bg-white py-3 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav aria-label="Atalho para página inicial">
              <Link
                href="/"
                className="inline-flex items-center whitespace-nowrap text-sm font-semibold text-green-700 transition-colors hover:text-green-800"
              >
                <span className="sm:hidden">Início</span>
                <span className="hidden sm:inline">← Página Inicial</span>
              </Link>
            </nav>
          </div>
        </div>

        <ServiceHero
          title="Blog de Notícias"
          subtitle="Todas as notícias do mundo imobiliário em um só lugar. Fique atualizado!"
          variant="brand"
        />

        <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">Em breve novos conteúdos</h2>
              <p className="mt-2 text-zinc-500">
                Nossa equipe está preparando artigos exclusivos sobre o mercado imobiliário. Volte em breve.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {posts.map((post) => (
                <div key={post.id} className="h-full">
                  <BlogCard
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    featuredImage={post.featuredImage}
                    publishedAt={post.publishedAt}
                    type={post.type}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
