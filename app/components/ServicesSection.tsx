import Image from "next/image";
import Link from "next/link";

/** Logo NAR (branca sobre chapa escura) — usada no mobile (centro) e no desktop (canto). */
function NarLogoBadge() {
  return (
    <div className="rounded-lg bg-zinc-900 p-2 shadow-lg ring-1 ring-black/20 sm:p-2.5">
      <Image
        src="/images/nar-logo-white.png"
        alt="National Association of REALTORS®"
        width={200}
        height={120}
        className="h-12 w-auto object-contain sm:h-14 lg:h-16"
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
    title: "Blog de Notícias",
    description:
      "Todas as notícias do mundo imobiliário em um só lugar. Fique atualizado!",
    href: "/blog",
  },
];

export function ServicesSection() {
  return (
    <section className="bg-zinc-50" aria-labelledby="services-heading">
      {/* Faixa em largura total — gradiente verde escuro (padrão Alto Padrão) */}
      <header className="group relative w-full bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950 px-4 py-6 transition-colors duration-300 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center text-center">
              <h2
                id="services-heading"
                className="relative inline-block max-w-4xl pb-2 text-2xl font-bold leading-snug tracking-tight text-white transition-all duration-500 ease-out text-balance after:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:h-[3px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-linear-to-r after:from-green-300 after:to-emerald-200 after:transition-all after:duration-500 after:ease-out group-hover:scale-[1.02] group-hover:text-white group-hover:[text-shadow:0_4px_28px_rgba(16,185,129,0.3)] group-hover:after:w-full active:scale-[1.02] active:text-white active:[text-shadow:0_4px_28px_rgba(16,185,129,0.3)] active:after:w-full sm:text-3xl lg:text-4xl"
              >
                Soluções específicas para compra, venda e investimento dentro e fora
                do Brasil.
              </h2>
              <p className="mt-3 max-w-3xl text-base font-medium leading-relaxed text-emerald-100 transition-all duration-500 ease-out group-hover:translate-y-0.5 group-hover:text-white active:translate-y-0.5 active:text-white sm:mt-4 sm:text-lg">
                Membro associado da National Association of REALTORS® (NAR)
              </p>
              <div className="mt-4 flex w-full justify-center sm:mt-5">
                <NarLogoBadge />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:auto-rows-fr lg:grid-cols-5 lg:gap-8">
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
              "group block flex h-full min-h-[44px] flex-col rounded-2xl border-2 border-zinc-400/85 bg-white p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9),0_10px_28px_-14px_rgba(15,23,42,0.4)] ring-1 ring-zinc-300/80 transition-all duration-300 max-md:active:border-emerald-800 max-md:active:bg-linear-to-b max-md:active:from-emerald-900 max-md:active:via-green-800 max-md:active:to-emerald-950 max-md:active:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),0_18px_44px_-16px_rgba(6,78,59,0.45)] max-md:active:ring-emerald-700/25 hover:border-emerald-800 hover:bg-linear-to-b hover:from-emerald-900 hover:via-green-800 hover:to-emerald-950 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),0_18px_44px_-16px_rgba(6,78,59,0.45)] hover:ring-emerald-700/25 sm:p-6 lg:p-7";

            return (
              <article key={service.title} className="h-full">
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
