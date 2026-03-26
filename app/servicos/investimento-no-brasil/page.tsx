import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { ServiceHero } from "@/app/components/ServiceHero";
import { LeadForm } from "@/app/components/LeadForm";
import {
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  SITE_NAME,
} from "@/lib/seo";

const canonical = buildCanonicalUrl("/servicos/investimento-no-brasil");

export const metadata: Metadata = {
  title: `Investimento no Brasil | ${SITE_NAME}`,
  description:
    "Assessoria completa para investidores estrangeiros: regularização fiscal, abertura de empresas, câmbio e seleção estratégica de ativos imobiliários no Brasil. 3Pinheiros CRECI 1317J.",
  alternates: { canonical },
  openGraph: buildOpenGraph({
    title: `Investimento no Brasil | ${SITE_NAME}`,
    description:
      "Assessoria completa para investidores: regularização fiscal, câmbio e seleção de ativos imobiliários no Brasil. 3Pinheiros CRECI 1317J.",
    url: canonical,
  }),
  twitter: buildTwitterCard({
    title: `Investimento no Brasil | ${SITE_NAME}`,
    description:
      "Assessoria completa para investidores: regularização fiscal, câmbio e seleção de ativos imobiliários no Brasil. 3Pinheiros CRECI 1317J.",
  }),
  robots: { index: true, follow: true },
};

const DIFERENCIAIS = [
  {
    title: "Regularização e documentação",
    description:
      "Suporte na obtenção de CPF, abertura de empresas e regularização fiscal para operar no Brasil.",
  },
  {
    title: "Operações de câmbio",
    description:
      "Orientação em transferência de capital, câmbio e conformidade regulatória para investimentos.",
  },
  {
    title: "Seleção estratégica de ativos",
    description:
      "Análise de oportunidades imobiliárias com visão de médio e longo prazo para decisões mais seguras.",
  },
  {
    title: "Visão de mercado",
    description:
      "Avaliação de localização, tendências e potencial de valorização para alinhar ativos ao seu perfil.",
  },
] as const;

const WHATSAPP_URL = "https://wa.me/5511999999999";

export default function InvestimentoNoBrasilPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen">
        <ServiceHero
          title="Investimento no Brasil"
          subtitle="Assessoria completa para investidores que desejam acessar oportunidades imobiliárias no Brasil com segurança e estratégia."
        />

        {/* Seção explicativa */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Como funciona
            </h2>
            <div className="mt-6 space-y-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
              <p>
                O serviço de Investimento no Brasil da 3Pinheiros oferece suporte
                completo para investidores que desejam acessar oportunidades
                imobiliárias em solo brasileiro. Atuamos desde a regularização
                fiscal e documental até a seleção estratégica de ativos, com
                visão de médio e longo prazo.
              </p>
              <p>
                Realizamos análise de ativos, avaliação de localização e
                potencial de valorização, além de orientação em operações de
                câmbio e transferência de capital. O objetivo é apoiar decisões
                mais seguras, alinhadas ao seu perfil de investidor e aos seus
                objetivos patrimoniais.
              </p>
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section className="bg-zinc-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Diferenciais do serviço
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {DIFERENCIAIS.map((item) => (
                <div
                  key={item.title}
                  className="group flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-[#0f5132] hover:bg-[#0f5132] hover:shadow-lg"
                >
                  <h3 className="text-base font-semibold text-zinc-900 transition-colors duration-300 group-hover:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 transition-colors duration-300 group-hover:text-white/90">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulário de lead */}
        <section
          className="bg-zinc-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          aria-label="Solicitar contato"
        >
          <div className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <LeadForm
              title="Fale com um especialista em investimento"
              subtitle="Preencha seus dados e entraremos em contato para entender seu perfil de investidor e as oportunidades que melhor se encaixam."
            />
          </div>
        </section>

        {/* CTA links */}
        <section
          className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
          aria-label="Outros canais"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-zinc-500">
              Ou entre em contato diretamente:
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contato"
                className="inline-flex rounded-full bg-green-800 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-900"
              >
                Ir para Contato
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-zinc-300 px-8 py-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
