import Image from "next/image";

/**
 * Logo NAR oficial (versão branca para fundo escuro).
 * Integrado ao hero — visual moderno e sofisticado.
 */
export function NARAuthoritySection() {
  return (
    <div className="flex shrink-0 items-center justify-center" aria-hidden>
      <Image
        src="/images/nar-logo-white.png"
        alt="National Association of REALTORS"
        width={100}
        height={80}
        className="object-contain"
      />
    </div>
  );
}
