import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Comprar imóvel", href: "/imoveis" },
  { label: "Alto Padrão", href: "/imoveis/alto-padrao" },
  { label: "Investimento", href: "/investir-no-brasil" },
  { label: "Quem Somos", href: "/quem-somos" },
  { label: "Contato", href: "/contato" },
];

export function Footer() {
  return (
    <footer className="pb-24 text-green-800 md:pb-0">
      {/* Área principal: degradê branco → cinza (contraste com seções claras e com o hero verde dos serviços) */}
      <div className="border-t border-zinc-400/70 bg-linear-to-b from-zinc-200 via-zinc-300/95 to-zinc-400/90">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
            {/* Marca */}
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="3Pinheiros"
                  width={40}
                  height={40}
                  loading="lazy"
                  className="object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-[#0f5132]">
                    3Pinheiros
                    <sup className="ml-0.5 align-super text-[0.65em] font-normal text-green-600">
                      ®
                    </sup>
                  </p>
                  <p className="text-xs font-medium text-green-600">
                    Consultoria Imobiliária
                  </p>
                </div>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-green-800">
                Consultoria imobiliária com foco em segurança e transparência.
              </p>
              <p className="text-xs font-semibold tracking-wide text-green-700">
                CRECI 1317J
              </p>
            </div>

            {/* Navegação */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0f5132]">
                Navegação
              </h3>
              <ul className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-green-700 transition-colors hover:text-[#0f5132]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0f5132]">
                Contato
              </h3>
              <ul className="flex flex-col gap-3 text-sm">
                <li>
                  <a
                    href="https://wa.me/message/5YEBRRXV7OACK1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-700 transition-colors hover:text-[#0f5132]"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:3pconsultoriaimobiliaria@gmail.com"
                    className="break-all text-sm font-medium text-green-700 transition-colors hover:text-[#0f5132]"
                  >
                    3pconsultoriaimobiliaria@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa de copyright — degradê verde profundo (referência visual do rodapé escuro + traço mint) */}
      <div className="w-full border-t border-[#86efac]/55 bg-linear-to-br from-[#004d33] via-[#003428] to-[#002b1b] px-4 py-5 text-center shadow-[inset_0_1px_0_0_rgba(134,239,172,0.35)] sm:px-6">
        <p className="text-sm font-semibold leading-relaxed text-white sm:text-base">
          © All rights reserved
          <span className="mx-2 text-[#bbf7d0]/90" aria-hidden>
            ·
          </span>
          Desenvolvido por Germano Pinheiro
        </p>
      </div>
    </footer>
  );
}
