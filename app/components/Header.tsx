"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [{ label: "Quem Somos", href: "/quem-somos" }];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 py-2"
          aria-label="3Pinheiros Consultoria Imobiliária - Página inicial"
        >
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="object-contain sm:w-11 sm:h-11"
            priority
          />
          <span className="hidden text-sm font-semibold leading-tight text-zinc-800 sm:block">
            3Pinheiros
            <span className="block text-xs font-normal text-green-700">
              Consultoria Imobiliária
            </span>
          </span>
          <span className="text-sm font-semibold text-zinc-800 sm:hidden">
            3Pinheiros
          </span>
        </Link>

        {/* Desktop nav — min-h para touch em tablets */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-[44px] items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-green-50 hover:text-green-700"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contato"
            className="ml-2 flex min-h-[44px] items-center rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-linear-to-b hover:from-emerald-900 hover:via-green-800 hover:to-emerald-950 hover:shadow-md"
          >
            Fale conosco
          </Link>
        </nav>

        {/* Mobile hamburger — min 44px touch target (Apple HIG) */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 md:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
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
          <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Menu principal">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="min-h-[44px] rounded-md px-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-green-50 hover:text-green-700 flex items-center"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contato"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-full bg-green-700 px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-linear-to-b hover:from-emerald-900 hover:via-green-800 hover:to-emerald-950 hover:shadow-md"
            >
              Fale conosco
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
