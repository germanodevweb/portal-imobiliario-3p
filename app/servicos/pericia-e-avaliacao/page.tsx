import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { WhatsAppButton } from "@/app/components/WhatsAppButton";
import { ServiceHero } from "@/app/components/ServiceHero";
import {
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  SITE_NAME,
} from "@/lib/seo";
import { getWhatsAppContactHref } from "@/lib/constants/contato";

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

export default function PericiaEAvaliacaoPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen">
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
          title="Perícia e Avaliação"
          subtitle="Laudos técnicos e avaliações imobiliárias com base contábil para decisões patrimoniais seguras."
          variant="brand"
        />

        {/* Seção explicativa */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Perícia e Avaliação
            </h2>
            <div className="mt-6 space-y-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
              <p>
                <strong>Avaliação Imobiliária (Mercadológica)</strong>
                <br />
                Focada em determinar o valor real de mercado para transações
                comerciais. É a ferramenta essencial para quem busca o preço
                justo em negociações e uma gestão de ativos eficiente.
              </p>
              <p>
                <strong>Foco:</strong> Precisão em valores de venda, locação ou
                garantias bancárias.
                <br />
                <strong>Aplicação:</strong> Compra e venda, inventários
                extrajudiciais e atualizações patrimoniais.
              </p>
              <p>
                <strong>Perícia Imobiliária (Judicial e Extrajudicial)</strong>
                <br />
                Um trabalho técnico de alta complexidade para a elaboração de
                Laudos Periciais com fundamentação científica. Atua como prova
                técnica definitiva em disputas, analisando conformidades e
                garantindo segurança jurídica.
              </p>
              <p>
                <strong>Foco:</strong> Suporte em decisões legais, auditorias
                técnicas e avaliações de aluguel (renovatórias).
                <br />
                <strong>Aplicação:</strong> Processos judiciais, partilhas de
                bens, ações renovatórias e liquidações.
              </p>
              <p>
                O corretor Germano Pinheiro é devidamente cadastrado no Tribunal
                de Justiça do Ceará (TJCE) e atua com frequência como Perito
                Nomeado para a resolução de casos complexos.
              </p>
              <p>
                Com vasta experiência em mediação e perícia, já auxiliamos na
                resolução de dezenas de demandas familiares e empresariais,
                incluindo:
              </p>
              <p>
                Disputas de bens e partilhas complexas.
                <br />
                Processos de divórcio e inventários.
                <br />
                Questões de tutorias e curatelas.
                <br />
                Avaliações para liquidação de sentenças.
              </p>
              <p>
                Nossa missão é transformar conflitos em soluções técnicas,
                entregando laudos imparciais que garantem a justiça e o valor
                real do patrimônio envolvido.
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
          <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-800/70 bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950 px-8 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_45px_-24px_rgba(6,78,59,0.7)] sm:px-12 sm:py-14">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Fale conosco
            </h2>
            <p className="mt-3 text-base font-medium text-emerald-100 sm:text-lg">
              Fale com especialistas para laudos periciais e avaliações
              imobiliárias com precisão técnica e segurança jurídica.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contato"
                className="inline-flex min-h-[46px] items-center rounded-full bg-white px-8 py-3.5 text-sm font-bold text-emerald-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md"
              >
                Ir para Contato
              </Link>
              <a
                href={getWhatsAppContactHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] items-center rounded-full border-2 border-emerald-200/80 bg-white/5 px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/15"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <WhatsAppButton />
      <Footer />
    </>
  );
}
