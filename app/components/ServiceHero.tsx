interface ServiceHeroProps {
  title: string;
  subtitle: string;
  variant?: "light" | "brand";
}

/**
 * Hero padronizado para páginas de serviços.
 * Label "SERVIÇOS" em verde, título com linha verde abaixo, subtítulo institucional.
 */
export function ServiceHero({
  title,
  subtitle,
  variant = "light",
}: ServiceHeroProps) {
  const isBrand = variant === "brand";

  return (
    <section
      className={`relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 ${
        isBrand
          ? "bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950"
          : "bg-zinc-50"
      }`}
    >
      <div className="mx-auto max-w-2xl text-center">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.25em] sm:text-xs ${
            isBrand ? "text-green-200/90" : "text-[#0f5132]"
          }`}
        >
          Serviços
        </p>
        <h1 className="group/title mt-3">
          <span className="relative inline-block pb-1">
            <span
              className={`text-4xl font-semibold tracking-tight sm:text-5xl sm:tracking-tighter ${
                isBrand ? "text-white" : "text-zinc-900"
              }`}
            >
              {title}
            </span>
            <span
              className={`absolute bottom-0 left-1/2 h-0.5 w-[72%] -translate-x-1/2 rounded-full transition-all duration-300 group-hover/title:w-full ${
                isBrand
                  ? "bg-green-200/80 group-hover/title:shadow-[0_0_12px_rgba(167,243,208,0.8)]"
                  : "bg-[#0f5132] group-hover/title:shadow-[0_0_10px_rgba(15,81,50,0.35)]"
              }`}
              aria-hidden
            />
          </span>
        </h1>
        <p
          className={`mx-auto mt-4 max-w-2xl text-lg leading-relaxed sm:text-xl sm:leading-8 ${
            isBrand ? "text-zinc-200" : "text-zinc-600"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
}
