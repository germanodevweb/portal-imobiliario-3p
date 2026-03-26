import Link from "next/link";

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
    <section
      className="bg-zinc-50 py-12 sm:py-16 lg:py-20"
      aria-labelledby="services-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="group mx-auto max-w-2xl cursor-default rounded-lg px-2 py-1 text-center transition-colors duration-300">
          <h2
            id="services-heading"
            className="text-xl font-semibold tracking-tight text-zinc-900 transition-colors duration-300 group-hover:text-green-800 sm:text-2xl lg:text-3xl"
          >
            Soluções estratégicas para compra, investimento e expansão patrimonial
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600 transition-colors duration-300 group-hover:text-zinc-500 sm:text-base">
            Atuação consultiva para clientes que buscam segurança, inteligência de
            mercado e oportunidades no Brasil e no exterior.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 lg:mt-14 lg:grid-cols-5 lg:gap-8">
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
              "group block flex min-h-[44px] flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#0f5132] hover:bg-[#0f5132] hover:shadow-lg sm:p-6 lg:p-7";

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
