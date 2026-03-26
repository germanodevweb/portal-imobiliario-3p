import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
import {
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  SITE_NAME,
} from "@/lib/seo";

const canonical = buildCanonicalUrl("/quem-somos");

export const metadata: Metadata = {
  title: `Quem Somos | ${SITE_NAME}`,
  description:
    "Conheça a equipe da 3Pinheiros Consultoria Imobiliária. Especialistas em imóveis residenciais e comerciais. CRECI 1317J.",
  alternates: { canonical },
  openGraph: buildOpenGraph({
    title: `Quem Somos | ${SITE_NAME}`,
    description:
      "Conheça a equipe da 3Pinheiros Consultoria Imobiliária. Especialistas em imóveis residenciais e comerciais. CRECI 1317J.",
    url: canonical,
  }),
  twitter: buildTwitterCard({
    title: `Quem Somos | ${SITE_NAME}`,
    description:
      "Conheça a equipe da 3Pinheiros Consultoria Imobiliária. Especialistas em imóveis residenciais e comerciais. CRECI 1317J.",
  }),
  robots: { index: true, follow: true },
};

const TEAM_MEMBERS = [
  {
    name: "Germano Pinheiro",
    role: "Sócio",
    image: "/images/team/germano-pinheiro.jpg",
    bio: "Bacharel em Ciências Contábeis e acadêmico de Análise de Sistemas, aplica seu conhecimento em números e inovação tecnológica no mercado imobiliário. Atua como Consultor Imobiliário e elabora Laudos Periciais Judiciais e Extrajudiciais. Associado à NAR (National Association of Realtors®), leva expertise e segurança ao investidor estrangeiro em negociações no Brasil.",
  },
  {
    name: "Fabio Pinheiro",
    role: "Sócio",
    image: "/images/team/fabio-pinheiro.png",
    bio: "Bacharel em Gestão Financeira e corretor de imóveis há mais de 15 anos, com dezenas de negociações realizadas. Especialista em proporcionar uma jornada de compra de alta qualidade, mantém um histórico de clientes recorrentes fundamentado na excelência do atendimento e na confiança de longo prazo.",
  },
] as const;

export default function QuemSomosPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen">
        {/* Hero — fundo limpo, tipografia moderna */}
        <section
          className={`${plusJakarta.className} relative overflow-hidden bg-zinc-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8`}
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:text-sm">
              Sobre nós
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl sm:tracking-tighter">
              Quem Somos
            </h1>
            <p className="mt-8 text-base leading-relaxed text-zinc-600 sm:text-lg sm:leading-8">
              Empresa familiar com um único objetivo: guiar você em uma jornada
              segura, humana e confortável.
            </p>
            <p className="mt-5 text-base leading-relaxed text-zinc-600 sm:text-lg sm:leading-8">
              Não vendemos apenas imóveis — oferecemos atendimento com excelência,
              transparência e respeito em cada etapa da sua conquista.
            </p>
          </div>
        </section>

        {/* Equipe — layout limpo */}
        <section
          className="relative overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
          aria-label="Equipe"
        >
          <div className="text-center">
            <h2 className="text-lg font-bold tracking-widest text-zinc-800 sm:text-xl">
              NOSSA EQUIPE
            </h2>
          </div>
          <div className="mt-6 grid w-full grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12">
            {TEAM_MEMBERS.map((member) => (
              <article
                key={member.name}
                className="relative flex min-w-0 flex-col"
              >
                <div className="group/card relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <Image
                    src={member.image}
                    alt={`Retrato profissional de ${member.name}, integrante da equipe.`}
                    width={400}
                    height={533}
                    className="size-full object-cover object-top transition-[filter,transform] duration-500 ease-out md:grayscale md:group-hover/card:scale-[1.03] md:group-hover/card:grayscale-0"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    priority={false}
                  />
                  {/* Overlay: visível no mobile; no desktop, aparece só no hover */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-16 opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover/card:opacity-100"
                    aria-hidden
                  >
                    <h3 className="text-base font-bold text-white drop-shadow-md sm:text-lg">
                      {member.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-white/90 sm:text-sm">
                      {member.role}
                    </p>
                    <p className="mt-3 max-h-24 overflow-y-auto text-left text-xs leading-relaxed text-white/95 sm:max-h-28 sm:text-sm">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA — aparência institucional, destaque discreto */}
        <section
          className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          aria-label="Chamada para ação"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-900 px-8 py-12 text-center sm:px-12 sm:py-14">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Fale com a 3 Pinheiros, agora!
            </h2>
            <p className="mt-3 text-sm text-zinc-400 sm:text-base">
              Conte com a nossa equipe para encontrar o imóvel ideal.
            </p>
            <Link
              href="/contato"
              className="mt-8 inline-flex rounded-full bg-green-800 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-900"
            >
              Ir para Contato
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
