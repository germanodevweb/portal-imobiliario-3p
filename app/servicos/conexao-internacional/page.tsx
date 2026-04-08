import type { Metadata } from "next";
import Image from "next/image";
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

const canonical = buildCanonicalUrl("/servicos/conexao-internacional");

const DIFERENCIAIS = [
  {
    title: "Atuação global",
    description:
      "Temos parcerias em mais de 70 países, facilitando possibilidades de investimento imobiliários.",
  },
  {
    title: "Rede de Parceiros",
    description:
      "Temos acesso direto a instituições e corretores de outros países associados a NAR.",
  },
  {
    title: "Agilidade",
    description:
      "Acesso rápido e seguro a imóveis dentro e fora do Brasil.",
  },
  {
    title: "Segurança Jurídica",
    description:
      "Toda a segurança jurídica e transparência dos associados da NAR a seu serviço.",
  },
] as const;

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

export default function ConexaoInternacionalPage() {
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
          title="Conexão Internacional"
          subtitle="Consultoria imobiliária com visão global: suporte para brasileiros no exterior e para investidores internacionais no Brasil."
          variant="brand"
        />

        {/* Seção explicativa */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Conectando negócios em outros países
            </h2>
            <div className="mt-6 space-y-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
              <p>
                A National Association of REALTORS® (NAR) não é apenas uma
                associação; é a maior e mais influente organização de
                profissionais imobiliários do mundo, com sede nos EUA e atuação
                em mais de 70 países.
              </p>
              <p>
                Ser um associado NAR significa que a 3 Pinheiros opera sob um
                Código de Ética rigoroso, que coloca os seus interesses acima
                de qualquer comissão. Para você, investidor, isso se traduz em:
              </p>
              <p>
                <strong>Confiança Transfronteiriça:</strong> Segurança total para
                investir em mercados como EUA, Dubai, França ou Portugal, com o
                respaldo de uma instituição global.
              </p>
              <p>
                <strong>Rede de Inteligência Exclusiva:</strong> Acesso a dados de
                mercado e parcerias estratégicas que poucos profissionais no
                Brasil possuem.
              </p>
              <p>
                <strong>Conexão Direta com Experts:</strong> Garantia de estar
                conectado aos melhores corretores locais em qualquer país,
                selecionados pelo padrão de excelência REALTOR®.
              </p>
              <p>
                Mais do que vender imóveis, nossa missão é conectar você às
                melhores oportunidades do planeta, garantindo que a sua jornada
                de investimento seja transparente, ética e global.
              </p>
            </div>
          </div>
        </section>

        {/* Bloco NAR */}
        <section className="bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Associado à National Association of REALTORS®
            </h2>
            <p className="mt-6 text-base leading-relaxed text-zinc-200 sm:text-lg">
              Germano Pinheiro, corretor associado à NAR, atua como o seu elo
              de confiança para negócios transfronteiriços. Mais do que
              facilitar a compra, ele garante que você esteja conectado a
              profissionais qualificados em qualquer lugar do globo, garantindo
              segurança jurídica e técnica em cada transação.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="rounded-lg bg-zinc-900 p-2 shadow-lg ring-1 ring-black/20 sm:p-2.5">
                <Image
                  src="/images/nar-logo-white.png"
                  alt="National Association of REALTORS®"
                  width={260}
                  height={156}
                  className="h-16 w-auto object-contain sm:h-20"
                  sizes="(max-width: 640px) 200px, 260px"
                />
              </div>
            </div>
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
          <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-800/70 bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950 px-8 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_45px_-24px_rgba(6,78,59,0.7)] sm:px-12 sm:py-14">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Fale conosco
            </h2>
            <p className="mt-3 text-base font-medium text-emerald-100 sm:text-lg">
              Conte com suporte internacional para conectar seu patrimônio a
              oportunidades sólidas no Brasil e no exterior.
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
