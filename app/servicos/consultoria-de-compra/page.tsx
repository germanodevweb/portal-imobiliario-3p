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
    title: "Jornada Consultiva",
    description:
      "Acompanhamento personalizado para entender sua real necessidade. Não é sobre o imóvel, é sobre entender sua necessidade e resolver.",
  },
  {
    title: "Due diligence técnica",
    description:
      "Auditoria completa de documentação e regularidade do imóvel. Segurança técnica para evitar riscos jurídicos ou financeiros.",
  },
  {
    title: "Análise de Viabilidade",
    description:
      "Alinhamento com seu perfil de investidor ou financeiro, com foco total em rentabilidade e proteção de capital.",
  },
  {
    title: "Segurança Contratual",
    description:
      "Assessoria completa no percurso da compra e venda, com clareza sobre valores, prazos e cláusulas, garantindo uma transação sem surpresas.",
  },
] as const;

const WHATSAPP_URL = "https://wa.me/message/5YEBRRXV7OACK1";

export default function ConsultoriaDeCompraPage() {
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
          title="Consultoria de Compra e Venda"
          subtitle="Acompanhamento consultivo em toda a jornada de aquisição, com foco em segurança e decisões alinhadas ao seu perfil."
          variant="brand"
        />

        {/* Seção explicativa */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Como funciona
            </h2>
            <div className="mt-6 space-y-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
              <p>
                A Consultoria de Compra da 3 Pinheiros oferece acompanhamento
                especializado em toda a jornada de aquisição de ativos
                imobiliários. Aqui entra nosso grande diferencial: nosso
                objetivo não é apenas vender ou comprar seu bem. É muito mais
                que isso.
              </p>
              <p>
                Nosso atendimento foca em entregar uma noção real e transparente
                de toda a jornada, desde o primeiro contato. Realizamos uma due
                diligence técnica rigorosa e analisamos as condições reais de
                mercado. Atuamos com transparência total em todas as etapas,
                desde a análise de viabilidade até a assinatura final do
                contrato.
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
          <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-800/70 bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950 px-8 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_45px_-24px_rgba(6,78,59,0.7)] sm:px-12 sm:py-14">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Fale conosco
            </h2>
            <p className="mt-3 text-base font-medium text-emerald-100 sm:text-lg">
              Conte com nossa equipe para uma jornada de compra segura e
              transparente.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contato"
                className="inline-flex min-h-[46px] items-center rounded-full bg-white px-8 py-3.5 text-sm font-bold text-emerald-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md"
              >
                Ir para Contato
              </Link>
              <a
                href={WHATSAPP_URL}
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
