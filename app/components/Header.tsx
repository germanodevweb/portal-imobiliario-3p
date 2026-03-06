"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Comprar", href: "/imoveis" },
  { label: "Alto Padrão", href: "/imoveis?categoria=alto-padrao" },
  { label: "Investimento", href: "/imoveis?categoria=investimento" },
  { label: "Quem Somos", href: "/quem-somos" },
  { label: "Contato", href: "/contato" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt="3Pinheiros Consultoria Imobiliária"
            width={44}
            height={44}
            className="object-contain"
            priority
          />
          <span className="hidden text-sm font-semibold leading-tight text-zinc-800 sm:block">
            3Pinheiros
            <br />
            <span className="text-xs font-normal text-green-700">
              Consultoria Imobiliária
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-green-50 hover:text-green-700"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contato"
            className="ml-2 rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800"
          >
            Fale conosco
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-md p-2 text-zinc-600 transition-colors hover:bg-zinc-100 md:hidden"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-zinc-100 bg-white md:hidden">
          <nav className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-green-50 hover:text-green-700"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contato"
              onClick={() => setMenuOpen(false)}
              className="mb-2 mt-2 rounded-full bg-green-700 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              Fale conosco
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
