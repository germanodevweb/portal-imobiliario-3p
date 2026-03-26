const filters = [
  { label: "Renda até R$ 2.850", href: "/imoveis?precoMax=190000" },
  { label: "Renda até R$ 4.700", href: "/imoveis?precoMax=264000" },
  { label: "Renda até R$ 8.000", href: "/imoveis?precoMax=350000" },
  { label: "Renda até R$ 12.000", href: "/imoveis?precoMax=450000" },
  { label: "Renda acima de R$ 12.000", href: "/imoveis?precoMin=450000" },
  { label: "Alto Padrão", href: "/imoveis/alto-padrao", highlight: true },
  { label: "Investimento", href: "/investir-no-brasil", highlight: true },
  { label: "Busca avançada", href: "/imoveis", highlight: true },
];

export function IncomeFilter() {
  return (
    <section
      className="border-b border-zinc-200/80 bg-gray-100 py-2 shadow-sm"
      aria-label="Filtros de renda e categorias"
    >
      <div className="relative mx-auto max-w-7xl">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-7 bg-linear-to-r from-gray-100 to-transparent sm:w-10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-7 bg-linear-to-l from-gray-100 to-transparent sm:w-10"
          aria-hidden
        />

        <div
          className="income-filter-scroll touch-pan-x overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
        >
          <div className="flex w-max gap-3 px-4 py-1 pr-10 sm:px-6 sm:pr-12 lg:px-8 lg:pr-14">
            {filters.map((filter) => (
              <a
                key={filter.label}
                href={filter.href}
                className={`flex min-h-[44px] shrink-0 snap-start items-center whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 ${
                  filter.highlight
                    ? "border border-green-600 bg-green-600 text-white hover:border-green-700 hover:bg-green-700"
                    : "border border-gray-300 bg-white text-zinc-800 hover:border-green-600 hover:bg-green-600 hover:text-white"
                }`}
              >
                {filter.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
