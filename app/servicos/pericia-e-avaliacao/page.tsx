import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { ServiceHero } from "@/app/components/ServiceHero";
import {
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  SITE_NAME,
} from "@/lib/seo";

const canonical = buildCanonicalUrl("/servicos/pericia-e-avaliacao");

export const metadata: Metadata = {
  title: `Perícia e Avaliação | ${SITE_NAME}`,
  description:
    "Laudos periciais judiciais e extrajudiciais com base contábil e técnica. Avaliação de imóveis para compra, venda, processos e divisão patrimonial. 3Pinheiros CRECI 1317J.",
  alternates: { canonical },
  openGraph: buildOpenGraph({
    title: `Perícia e Avaliação | ${SITE_NAME}`,
    description:
      "Laudos periciais judiciais e extrajudiciais. Avaliação técnica de imóveis para decisões patrimoniais seguras. 3Pinheiros CRECI 1317J.",
    url: canonical,
  }),
  twitter: buildTwitterCard({
    title: `Perícia e Avaliação | ${SITE_NAME}`,
    description:
      "Laudos periciais judiciais e extrajudiciais. Avaliação técnica de imóveis para decisões patrimoniais seguras. 3Pinheiros CRECI 1317J.",
  }),
  robots: { index: true, follow: true },
};

const CONTEXTOS = [
  {
    title: "Compra e venda",
    description:
      "Avaliação para embasar negociação e garantir preço justo na transação.",
  },
  {
    title: "Processos judiciais",
    description:
      "Laudos periciais para ações de desapropriação, inventário e litígios imobiliários.",
  },
  {
    title: "Divisão patrimonial",
    description:
      "Avaliação técnica para partilha de bens, inventário e planejamento sucessório.",
  },
  {
    title: "Investimento",
    description:
      "Análise de valor para decisões de aquisição, venda ou reavaliação de ativos.",
  },
] as const;

const DIFERENCIAIS = [
  {
    title: "Análise técnica",
    description:
      "Metodologia embasada em normas técnicas e conhecimento contábil aplicado ao imobiliário.",
  },
  {
    title: "Segurança nas decisões",
    description:
      "Laudos que fundamentam decisões patrimoniais com transparência e precisão.",
  },
  {
    title: "Avaliação precisa",
    description:
      "Determinação do valor de mercado com base em critérios técnicos e comparativos.",
  },
  {
    title: "Suporte profissional",
    description:
      "Atendimento consultivo para esclarecer dúvidas e orientar sobre o uso do laudo.",
  },
] as const;

const WHATSAPP_URL = "https://wa.me/5511999999999";

export default function PericiaEAvaliacaoPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen">
        <ServiceHero
          title="Perícia e Avaliação"
          subtitle="Laudos técnicos e avaliações imobiliárias com base contábil para decisões patrimoniais seguras."
        />

        {/* Seção explicativa */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              O serviço
            </h2>
            <div className="mt-6 space-y-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
              <p>
                A 3Pinheiros elabora laudos periciais judiciais e extrajudiciais
                para avaliação de imóveis. Nossa atuação combina conhecimento
                técnico imobiliário e base contábil, garantindo análises precisas
                que suportam a tomada de decisão em contextos diversos.
              </p>
              <p>
                Realizamos avaliações para compra e venda, processos judiciais,
                divisão patrimonial e planejamento de investimentos. Os laudos
                seguem metodologia técnica e normas aplicáveis, com foco em
                transparência e no valor real do patrimônio.
              </p>
            </div>
          </div>
        </section>

        {/* Seção de aplicação */}
        <section className="bg-zinc-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Quando o serviço é útil
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {CONTEXTOS.map((item) => (
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

        {/* Diferenciais */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Diferenciais
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

        {/* CTA */}
        <section
          className="bg-zinc-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          aria-label="Chamada para ação"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-900 px-8 py-12 text-center sm:px-12 sm:py-14">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Fale conosco
            </h2>
            <p className="mt-3 text-sm text-zinc-400 sm:text-base">
              Conte com nossa equipe para laudos técnicos e avaliações com
              credibilidade.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
                className="inline-flex rounded-full border border-zinc-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-800"
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
