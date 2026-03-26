import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { InvestmentLanguageSelector } from "@/app/components/InvestmentLanguageSelector";
import { InvestmentPropertyCard } from "@/app/components/InvestmentPropertyCard";
import { NARAuthoritySection } from "@/app/components/NARAuthoritySection";
import { LeadForm } from "@/app/components/LeadForm";
import {
  getInternationalInvestmentProperties,
  countInternationalInvestmentProperties,
} from "@/lib/queries/properties";
import { getEurToBrlRate } from "@/lib/services/exchange-rate";
import type { InvestContent } from "@/lib/i18n/invest";

type InvestPageContentProps = {
  content: InvestContent;
};

export async function InvestPageContent({ content }: InvestPageContentProps) {
  const [properties, count, eurToBrlRate] = await Promise.all([
    getInternationalInvestmentProperties(),
    countInternationalInvestmentProperties(),
    getEurToBrlRate(),
  ]);

  return (
    <>
      <Header />

      <main>
        {/* Barra de idioma */}
        <div className="border-b border-zinc-100 bg-white py-3 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-green-700"
            >
              ← 3Pinheiros
            </Link>
            <InvestmentLanguageSelector />
          </div>
        </div>

        {/* Hero — compacto, sofisticado, fundo escuro unificado */}
        <section className="relative overflow-hidden bg-zinc-900 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            {/* Conteúdo — esquerda */}
            <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {content.hero.title}
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                {content.nar.associationLine}
              </p>
              {content.hero.subtitle && (
                <p className="mt-1 text-base text-zinc-300 sm:text-lg">
                  {content.hero.subtitle}
                </p>
              )}
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                {content.nar.ethicalText}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <a
                  href={content.hero.ctaPrimaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
                >
                  {content.hero.ctaPrimary}
                </a>
                <a
                  href="#imoveis"
                  className="inline-flex items-center rounded-full border border-zinc-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/5"
                >
                  {content.hero.ctaSecondary}
                </a>
              </div>
              <p className="mt-4 text-sm font-medium text-white/90">
                {content.nar.trustMessage}
              </p>
            </div>

            {/* Logo NAR — direita */}
            <NARAuthoritySection />
          </div>
        </section>

        {/* Listagem de imóveis */}
        <section
          id="imoveis"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {content.listing.title}
          </h2>
          <p className="mb-10 text-sm text-zinc-500">
            {content.listing.priceDisclaimer}
          </p>

          {count === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <p className="text-zinc-600">{content.listing.empty}</p>
              <p className="mt-2 text-sm text-zinc-500">
                {content.listing.emptyHint}
              </p>
              <a
                href={content.hero.ctaPrimaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
              >
                {content.hero.ctaPrimary}
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <InvestmentPropertyCard
                  key={property.id}
                  property={property}
                  eurToBrlRate={eurToBrlRate}
                />
              ))}
            </div>
          )}
        </section>

        {/* Formulário de lead — captação em contexto de investimento */}
        <section
          className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          aria-label="Solicitar contato"
        >
          <div className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <LeadForm
              title="Fale com um especialista em investimento"
              subtitle="Preencha seus dados e entraremos em contato para entender seu perfil de investidor e as oportunidades que melhor se encaixam."
            />
          </div>
        </section>

        {/* Credibilidade */}
        <section className="border-t border-zinc-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-50/50 p-8 text-center">
            <h2 className="text-lg font-semibold text-zinc-900">
              {content.credibility.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              {content.credibility.description}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
