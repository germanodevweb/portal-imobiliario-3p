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

const canonical = buildCanonicalUrl("/servicos/consultoria-de-compra");

export const metadata: Metadata = {
  title: `Consultoria de Compra e Venda | ${SITE_NAME}`,
  description:
    "Acompanhamento consultivo na jornada de aquisição de imóveis. Análise de oportunidades, due diligence e negociação com foco em segurança e alinhamento ao seu perfil. 3Pinheiros CRECI 1317J.",
  alternates: { canonical },
  openGraph: buildOpenGraph({
    title: `Consultoria de Compra e Venda | ${SITE_NAME}`,
    description:
      "Acompanhamento consultivo na jornada de aquisição de imóveis. Análise de oportunidades, due diligence e negociação. 3Pinheiros CRECI 1317J.",
    url: canonical,
  }),
  twitter: buildTwitterCard({
    title: `Consultoria de Compra e Venda | ${SITE_NAME}`,
    description:
      "Acompanhamento consultivo na jornada de aquisição de imóveis. Análise de oportunidades, due diligence e negociação. 3Pinheiros CRECI 1317J.",
  }),
  robots: { index: true, follow: true },
};

const DIFERENCIAIS = [
  {
    title: "Jornada completa",
    description:
      "Acompanhamento em todas as etapas: busca, análise, visita, negociação e documentação.",
  },
  {
    title: "Due diligence técnica",
    description:
      "Verificação de documentação, regularidade do imóvel e condições para decisões seguras.",
  },
  {
    title: "Alinhamento ao perfil",
    description:
      "Entendimento do seu objetivo, orçamento e preferências para recomendações adequadas.",
  },
  {
    title: "Transparência na negociação",
    description:
      "Suporte na negociação com clareza sobre valores, prazos e condições contratuais.",
  },
] as const;

const WHATSAPP_URL = "https://wa.me/5511999999999";

export default function ConsultoriaDeCompraPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen">
        <ServiceHero
          title="Consultoria de Compra e Venda"
          subtitle="Acompanhamento consultivo em toda a jornada de aquisição, com foco em segurança e decisões alinhadas ao seu perfil."
        />

        {/* Seção explicativa */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Como funciona
            </h2>
            <div className="mt-6 space-y-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
              <p>
                A Consultoria de Compra e Venda da 3Pinheiros oferece acompanhamento
                consultivo em toda a jornada de aquisição de imóveis. Não
                vendemos apenas propriedades — orientamos você em cada etapa,
                desde a análise de oportunidades até a negociação e a
                documentação final.
              </p>
              <p>
                Realizamos due diligence técnica para verificar a regularidade do
                imóvel, documentação e condições de compra. Apoiamos na
                negociação com transparência sobre valores, prazos e condições
                contratuais, sempre com foco em segurança e alinhamento ao seu
                perfil e objetivos.
              </p>
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section className="bg-zinc-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Diferenciais da consultoria
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
          className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          aria-label="Chamada para ação"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-900 px-8 py-12 text-center sm:px-12 sm:py-14">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Fale conosco
            </h2>
            <p className="mt-3 text-sm text-zinc-400 sm:text-base">
              Conte com nossa equipe para uma jornada de compra segura e
              transparente.
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
