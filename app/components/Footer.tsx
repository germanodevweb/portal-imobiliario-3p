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
    <footer className="border-t border-zinc-800 bg-zinc-900 text-zinc-400 pb-24 md:pb-0">
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
                className="object-contain brightness-90"
              />
              <div>
                <p className="text-sm font-semibold text-white">3Pinheiros</p>
                <p className="text-xs text-green-500">Consultoria Imobiliária</p>
              </div>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
              Consultoria imobiliária com foco em segurança e transparência.
            </p>
            <p className="text-xs font-medium text-zinc-600">CRECI 1317J</p>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Navegação
            </h3>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Contato
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@3pinheiros.com.br"
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  contato@3pinheiros.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} 3Pinheiros Consultoria Imobiliária. Todos os
          direitos reservados.
        </div>
      </div>
    </footer>
  );
}
