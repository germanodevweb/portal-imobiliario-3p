const filters = [
  { label: "Renda até R$ 2.850", href: "/imoveis?renda=2850" },
  { label: "Renda até R$ 4.700", href: "/imoveis?renda=4700" },
  { label: "Renda até R$ 8.000", href: "/imoveis?renda=8000" },
  { label: "Renda até R$ 12.000", href: "/imoveis?renda=12000" },
  { label: "Renda acima de R$ 12.000", href: "/imoveis?renda=12000plus" },
  { label: "Alto Padrão", href: "/imoveis?categoria=alto-padrao", highlight: true },
  { label: "Investimento", href: "/imoveis?categoria=investimento", highlight: true },
  { label: "Busca avançada", href: "/imoveis", highlight: true },
];

export function IncomeFilter() {
  return (
    <section className="border-b border-zinc-100 bg-white py-3 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((filter) => (
            <a
              key={filter.label}
              href={filter.href}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                filter.highlight
                  ? "border-green-700 bg-green-700 text-white hover:bg-green-800 hover:border-green-800"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-green-700 hover:text-green-700"
              }`}
            >
              {filter.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
