import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { getWhatsAppContactHref } from "@/lib/constants/contato";
import { EMPRESA_ENDERECO_DISPLAY } from "@/lib/constants/endereco-empresa";

const socialLinks = [
  {
    href: "https://www.instagram.com/3pinheiros.consultoria/",
    label: "Instagram 3 Pinheiros",
    Icon: Instagram,
    buttonClassName:
      "bg-linear-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-90 focus-visible:outline-[#E1306C]",
  },
  {
    href: "https://www.facebook.com/3pinheiros.Imobiliaria",
    label: "Facebook 3 Pinheiros",
    Icon: Facebook,
    buttonClassName:
      "bg-[#1877F2] hover:bg-[#166FE5] focus-visible:outline-[#1877F2]",
  },
  {
    href: "https://www.youtube.com/@3pinheirosconsultoriaimobi265",
    label: "YouTube 3 Pinheiros",
    Icon: Youtube,
    buttonClassName:
      "bg-[#FF0000] hover:bg-[#CC0000] focus-visible:outline-[#FF0000]",
  },
] as const;

const navLinks = [
  { label: "Comprar imóvel", href: "/imoveis" },
  { label: "Alto Padrão", href: "/imoveis/alto-padrao" },
  { label: "Investimento", href: "/investir-no-brasil" },
  { label: "Quem Somos", href: "/quem-somos" },
  { label: "Blog Imobiliário", href: "/blog" },
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
                  sizes="40px"
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
              <p className="max-w-xs text-sm font-bold leading-relaxed tracking-wide text-[#0f5132]">
                Ética e respeito com nosso cliente.
                <br />
                CRECI 1317J
              </p>
            </div>

            {/* Navegação */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#0f5132]">
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
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#0f5132]">
                Contato
              </h3>
              <ul className="flex flex-col gap-3 text-sm">
                <li>
                  <a
                    href={getWhatsAppContactHref()}
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
                <li>
                  <address className="not-italic text-sm font-medium leading-relaxed text-green-700">
                    {EMPRESA_ENDERECO_DISPLAY.linha1}
                    <br />
                    {EMPRESA_ENDERECO_DISPLAY.linha2}
                    <br />
                    {EMPRESA_ENDERECO_DISPLAY.linha3}
                  </address>
                </li>
              </ul>
              <ul
                className="mt-5 flex flex-wrap items-center gap-2"
                aria-label="Redes sociais da 3 Pinheiros"
              >
                {socialLinks.map(({ href, label, Icon, buttonClassName }) => (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${buttonClassName}`}
                    >
                      <Icon className="h-5 w-5 shrink-0 text-white" strokeWidth={1.75} aria-hidden />
                    </a>
                  </li>
                ))}
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
