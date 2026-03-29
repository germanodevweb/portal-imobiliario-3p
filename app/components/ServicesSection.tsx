import Image from "next/image";
import Link from "next/link";

/** Logo NAR (branca sobre chapa escura) — usada no mobile (centro) e no desktop (canto). */
function NarLogoBadge() {
  return (
    <div className="rounded-lg bg-zinc-900 p-2.5 shadow-lg ring-1 ring-black/20 sm:p-3">
      <Image
        src="/images/nar-logo-white.png"
        alt="National Association of REALTORS®"
        width={200}
        height={120}
        className="h-14 w-auto object-contain sm:h-16 lg:h-20"
        sizes="(max-width: 640px) 180px, (max-width: 1024px) 200px, 220px"
      />
    </div>
  );
}

const services = [
  {
    title: "Consultoria de Compra e Venda",
    description:
      "Acompanhamento consultivo em toda a jornada de aquisição. Análise de oportunidades, due diligence e negociação para decisões seguras e alinhadas ao seu perfil.",
    href: "/servicos/consultoria-de-compra",
  },
  {
    title: "Investimento no Brasil",
    description:
      "Assessoria completa para capital estrangeiro: regularização fiscal, abertura de empresas, câmbio e seleção estratégica de ativos imobiliários em solo brasileiro.",
    href: "/servicos/investimento-no-brasil",
  },
  {
    title: "Conexão Internacional",
    description:
      "Consultoria para brasileiros que buscam diversificar patrimônio e adquirir imóveis no exterior, com suporte da expertise NAR e rede global de parceiros.",
    href: "/servicos/conexao-internacional",
  },
  {
    title: "Perícia e Avaliação",
    description:
      "Laudos periciais judiciais e extrajudiciais com base contábil e técnica. Garantia do valor real do patrimônio em processos e avaliações particulares.",
    href: "/servicos/pericia-e-avaliacao",
  },
  {
    title: "Inteligência de Mercado",
    description:
      "Análises setoriais, atualizações jurídicas e tendências de tecnologia aplicada ao imobiliário. Conteúdo estratégico para decisões informadas.",
    href: "/blog",
  },
];

export function ServicesSection() {
  return (
    <section className="bg-zinc-50" aria-labelledby="services-heading">
      {/* Faixa em largura total — gradiente cinza premium (esquerda → direita) */}
      <header className="group relative w-full bg-linear-to-r from-zinc-500/95 via-zinc-200/75 to-white px-4 py-10 transition-colors duration-300 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl pb-4 md:pb-10">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center text-center">
              <h2
                id="services-heading"
                className="relative inline-block max-w-4xl pb-2 text-2xl font-bold leading-snug tracking-tight text-green-900 transition-all duration-500 ease-out text-balance after:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:h-[3px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-linear-to-r after:from-green-600 after:to-emerald-500 after:transition-all after:duration-500 after:ease-out group-hover:scale-[1.02] group-hover:text-emerald-950 group-hover:[text-shadow:0_4px_28px_rgba(22,101,52,0.28)] group-hover:after:w-full active:scale-[1.02] active:text-emerald-950 active:[text-shadow:0_4px_28px_rgba(22,101,52,0.28)] active:after:w-full sm:text-3xl lg:text-4xl"
              >
                Soluções específicas para compra, venda e investimento dentro e fora
                do Brasil.
              </h2>
              <p className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-green-900 transition-all duration-500 ease-out group-hover:translate-y-0.5 group-hover:text-emerald-900 active:translate-y-0.5 active:text-emerald-900 sm:mt-6 sm:text-lg">
                Membro associado da National Association of REALTORS® (NAR)
              </p>
              <div className="mt-7 flex w-full justify-center md:mt-8">
                <NarLogoBadge />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-5 lg:gap-8">
          {services.map((service) => {
            const cardContent = (
              <>
                <h3 className="text-lg font-semibold text-zinc-900 transition-colors duration-300 group-hover:text-white">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 transition-colors duration-300 group-hover:text-white/90">
                  {service.description}
                </p>
              </>
            );
            const baseClasses =
              "group block flex min-h-[44px] flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-800 hover:bg-linear-to-b hover:from-emerald-900 hover:via-green-800 hover:to-emerald-950 hover:shadow-lg sm:p-6 lg:p-7";

            return (
              <article key={service.title}>
                {service.href ? (
                  <Link href={service.href} className={baseClasses}>
                    {cardContent}
                  </Link>
                ) : (
                  <div className={baseClasses}>{cardContent}</div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
