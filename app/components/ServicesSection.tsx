const services = [
  {
    icon: "🤝",
    title: "Parceria 40% – 60%",
    description:
      "Corretor, cadastre o imóvel do seu cliente e ganhe até 60% de comissão na venda. Trabalhamos juntos para fechar o melhor negócio.",
  },
  {
    icon: "🎁",
    title: "Indicou e Comprou",
    description:
      "Indique um cliente e, se ele comprar, você ganha 3 dias no Resort 3 Pinheiros. Simples assim.",
  },
  {
    icon: "🔍",
    title: "Perícia de Imóveis",
    description:
      "Avaliações judiciais e extrajudiciais com laudos técnicos precisos para garantir segurança na sua transação.",
  },
  {
    icon: "🌎",
    title: "Investir no Brasil",
    description:
      "Assessoria completa para estrangeiros: CPF, abertura de empresa, câmbio, transferência de capital e compra de imóveis.",
  },
];

export function ServicesSection() {
  return (
    <section className="bg-green-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Nossos serviços
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Soluções completas para corretores, compradores e investidores
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="flex flex-col gap-3 rounded-xl border border-green-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-3xl" role="img" aria-label={service.title}>
                {service.icon}
              </span>
              <h3 className="text-sm font-bold text-zinc-900">{service.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
