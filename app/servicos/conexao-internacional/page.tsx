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

const canonical = buildCanonicalUrl("/servicos/conexao-internacional");

export const metadata: Metadata = {
  title: `Conexão Internacional | ${SITE_NAME}`,
  description:
    "Consultoria imobiliária com atuação global. Suporte para brasileiros que investem no exterior e para clientes internacionais no Brasil. Associados à NAR. 3Pinheiros CRECI 1317J.",
  alternates: { canonical },
  openGraph: buildOpenGraph({
    title: `Conexão Internacional | ${SITE_NAME}`,
    description:
      "Consultoria imobiliária com atuação global. Suporte para brasileiros e investidores internacionais. Associados à NAR. 3Pinheiros CRECI 1317J.",
    url: canonical,
  }),
  twitter: buildTwitterCard({
    title: `Conexão Internacional | ${SITE_NAME}`,
    description:
      "Consultoria imobiliária com atuação global. Suporte para brasileiros e investidores internacionais. Associados à NAR. 3Pinheiros CRECI 1317J.",
  }),
  robots: { index: true, follow: true },
};

const DIFERENCIAIS = [
  {
    title: "Atuação global",
    description:
      "Suporte para brasileiros que desejam investir fora e para estrangeiros interessados em oportunidades no Brasil.",
  },
  {
    title: "Rede de parceiros",
    description:
      "Conexão com profissionais imobiliários qualificados em diversos mercados internacionais.",
  },
  {
    title: "Suporte estratégico",
    description:
      "Análise e orientação para decisões alinhadas ao seu perfil e objetivos de investimento.",
  },
  {
    title: "Atendimento personalizado",
    description:
      "Acompanhamento consultivo em cada etapa, com foco em transparência e segurança.",
  },
] as const;

const WHATSAPP_URL = "https://wa.me/5511999999999";

export default function ConexaoInternacionalPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen">
        <ServiceHero
          title="Conexão Internacional"
          subtitle="Consultoria imobiliária com visão global: suporte para brasileiros no exterior e para investidores internacionais no Brasil."
        />

        {/* Seção explicativa */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Atuação em dois sentidos
            </h2>
            <div className="mt-6 space-y-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
              <p>
                A Conexão Internacional da 3Pinheiros atende brasileiros que
                desejam diversificar patrimônio e adquirir imóveis fora do país,
                e também clientes internacionais interessados em oportunidades
                imobiliárias no Brasil. Oferecemos suporte estratégico na decisão
                e acesso a uma rede de parceiros qualificados em diversos
                mercados.
              </p>
              <p>
                Com visão de médio e longo prazo, apoiamos na análise de ativos,
                avaliação de riscos e na condução de negociações com
                transparência. Nossa atuação consultiva visa decisões mais
                seguras e alinhadas ao seu perfil de investidor.
              </p>
            </div>
          </div>
        </section>

        {/* Bloco NAR */}
        <section className="bg-zinc-900 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Associados à National Association of REALTORS®
            </h2>
            <p className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg">
              A 3Pinheiros é associada à NAR, a maior associação de
              profissionais imobiliários do mundo. Esse vínculo garante padrão
              internacional de atendimento e conexão com profissionais
              qualificados em diversos países, ampliando as oportunidades para
              nossos clientes.
            </p>
            <p className="mt-4 text-sm text-zinc-500">
              Padrão internacional. Conexão global. Credibilidade.
            </p>
          </div>
        </section>

        {/* Diferenciais */}
        <section className="bg-zinc-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
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
          className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          aria-label="Chamada para ação"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-900 px-8 py-12 text-center sm:px-12 sm:py-14">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Fale conosco
            </h2>
            <p className="mt-3 text-sm text-zinc-400 sm:text-base">
              Conte com nossa equipe para conectar você a oportunidades no Brasil
              e no exterior.
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
