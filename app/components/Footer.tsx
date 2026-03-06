import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { label: "Comprar imóvel", href: "/imoveis" },
  { label: "Alto Padrão", href: "/imoveis?categoria=alto-padrao" },
  { label: "Investimento", href: "/imoveis?categoria=investimento" },
  { label: "Quem Somos", href: "/quem-somos" },
  { label: "Contato", href: "/contato" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-900 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Marca */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="3Pinheiros"
                width={40}
                height={40}
                className="object-contain brightness-90"
              />
              <div>
                <p className="text-sm font-semibold text-white">3Pinheiros</p>
                <p className="text-xs text-green-500">Consultoria Imobiliária</p>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-500">
              CRECI 1317J — Especialistas em imóveis residenciais e comerciais.
              Atendemos compradores, investidores e corretores parceiros.
            </p>
            <div className="flex gap-3 text-xs font-medium">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-green-500"
              >
                YouTube
              </a>
              <span className="text-zinc-700">·</span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-green-500"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-300">
              Navegação
            </h3>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-green-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-300">
              Contato
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-green-500"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@3pinheiros.com.br"
                  className="transition-colors hover:text-green-500"
                >
                  contato@3pinheiros.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} 3Pinheiros Consultoria Imobiliária. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
}
