interface ServiceHeroProps {
  title: string;
  subtitle: string;
}

/**
 * Hero padronizado para páginas de serviços.
 * Label "SERVIÇOS" em verde, título com linha verde abaixo, subtítulo institucional.
 */
export function ServiceHero({ title, subtitle }: ServiceHeroProps) {
  return (
    <section className="relative overflow-hidden bg-zinc-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#0f5132]">
          Serviços
        </p>
        <h1 className="mt-3">
          <span className="relative inline-block pb-1">
            <span className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl sm:tracking-tighter">
              {title}
            </span>
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f5132]"
              aria-hidden
            />
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg sm:leading-8">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
