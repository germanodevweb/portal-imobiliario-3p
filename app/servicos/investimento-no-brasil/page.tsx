import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { WhatsAppButton } from "@/app/components/WhatsAppButton";
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
      "Suporte completo na obtenção de CPF para estrangeiros, abertura de empresas e toda a regularização fiscal necessária para operar com segurança no Brasil.",
  },
  {
    title: "Operações de câmbio",
    description:
      "Orientação técnica em transferência de capital, câmbio e conformidade regulatória. Segurança financeira para que seus recursos cheguem e retornem conforme a lei.",
  },
  {
    title: "Seleção estratégica de ativos",
    description:
      "Análise minuciosa de oportunidades imobiliárias com visão pericial. Foco em ativos de alta liquidez e segurança para decisões de investimento inteligentes.",
  },
  {
    title: "Visão de Mercado (Expertise Técnica)",
    description:
      "Avaliação de localização e tendências de valorização baseadas em dados reais. Alinhamos as oportunidades do mercado brasileiro aos seus planos globais.",
  },
] as const;

const WHATSAPP_URL = "https://wa.me/message/5YEBRRXV7OACK1";

export default function InvestimentoNoBrasilPage() {
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
          title="Investimento no Brasil"
          subtitle="Assessoria completa para investidores que desejam acessar oportunidades imobiliárias no Brasil com segurança e estratégia."
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
                O serviço de Investimento no Brasil da 3 Pinheiros oferece
                suporte completo para quem busca oportunidades sólidas em solo
                brasileiro. Nossa atuação vai muito além da escolha do imóvel.
              </p>
              <p>
                Contamos com empresas parceiras que são experts em regularização
                fiscal e documental, operações de câmbio e transferência de capital,
                assegurando que cada etapa esteja alinhada ao seu perfil de
                investidor e aos seus objetivos patrimoniais de médio e longo
                prazo, garantindo que o investidor opere com total segurança
                jurídica. Realizamos a análise técnica dos imóveis ou ativos
                imobiliários, avaliação de localização e potencial de valorização
                real.
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
          <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-800/70 bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950 px-8 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_45px_-24px_rgba(6,78,59,0.7)] sm:px-12 sm:py-14">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Fale conosco
            </h2>
            <p className="mt-3 text-base font-medium text-emerald-100 sm:text-lg">
              Receba orientação estratégica para investir no Brasil com
              segurança jurídica e visão de longo prazo.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
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
