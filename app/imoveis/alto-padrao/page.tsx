import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import { VideoHeroBackground } from "@/app/components/VideoHeroBackground";
import {
  getAltoPadraoApartments,
  countAltoPadraoApartments,
} from "@/lib/queries/properties";
import {
  buildAltoPadraoPageTitle,
  buildAltoPadraoPageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
} from "@/lib/seo";

const canonical = buildCanonicalUrl("/imoveis/alto-padrao");

export async function generateMetadata(): Promise<Metadata> {
  const count = await countAltoPadraoApartments();
  const title = buildAltoPadraoPageTitle();
  const description = buildAltoPadraoPageDescription(count);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: buildOpenGraph({ title, description, url: canonical }),
    twitter: buildTwitterCard({ title, description }),
    robots: { index: true, follow: true },
  };
}

export default async function AltoPadraoPage() {
  const [properties, count] = await Promise.all([
    getAltoPadraoApartments(),
    countAltoPadraoApartments(),
  ]);

  return (
    <>
      <Header />

      <main>
        {/* Hero — fundo full-bleed, sem barras laterais */}
        <section className="relative min-h-[320px] w-full overflow-hidden bg-zinc-900 py-20 sm:py-28">
          <VideoHeroBackground
            videoSrc="/videos/alto-padrao.mp4"
            overlayClassName="bg-black/60"
          />
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Imóveis de Alto Padrão
            </h1>
            <p className="mt-4 text-lg text-zinc-300 sm:text-xl">
              Seleção exclusiva para quem busca localização nobre, sofisticação e
              imóveis de alto valor.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contato"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-base font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                Falar com especialista
              </Link>
              <a
                href="#imoveis"
                className="inline-flex items-center rounded-full border-2 border-white/50 px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                Ver imóveis
              </a>
            </div>
          </div>
        </section>

        {/* Listagem */}
        <section
          id="imoveis"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex items-center gap-2 text-sm text-zinc-500"
          >
            <Link href="/" className="transition-colors hover:text-green-700">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/imoveis" className="transition-colors hover:text-green-700">
              Imóveis
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-zinc-800">
              Imóveis de Alto Padrão
            </span>
          </nav>

          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {count === 0
                ? "Nenhum imóvel encontrado neste momento"
                : `${count} ${count !== 1 ? "imóveis" : "imóvel"} de alto padrão`}
            </h2>
            <p className="mt-2 text-zinc-600">
              {count > 0 &&
                "Imóveis selecionados com preço a partir de R$ 1.500.000."}
            </p>
          </div>

          {count > 0 ? (
            <PropertyList properties={properties} />
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <p className="text-zinc-600">
                Não há imóveis de alto padrão disponíveis no momento.
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Entre em contato para ser avisado quando surgirem novas oportunidades.
              </p>
              <Link
                href="/contato"
                className="mt-6 inline-flex items-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
              >
                Falar com especialista
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
