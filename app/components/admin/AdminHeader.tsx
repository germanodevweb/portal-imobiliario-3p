"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { logoutAdminAction } from "@/app/login/actions";

const navLinkClass =
  "rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 min-h-[44px] flex items-center";

/**
 * Cabeçalho da área administrativa.
 * Menu colapsável em telas pequenas para melhor uso em mobile.
 */
export function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-40 border-b border-zinc-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="flex min-w-0 flex-shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90 sm:gap-3"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/logo.png"
            alt="3Pinheiros"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-zinc-900">
              3Pinheiros
            </span>
            <span className="block text-xs text-green-700">Painel Admin</span>
          </div>
        </Link>

        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
          <nav
            className="hidden items-center gap-0.5 md:flex"
            aria-label="Navegação principal"
          >
            <Link href="/admin/imoveis" className={navLinkClass}>
              Imóveis
            </Link>
            <Link href="/admin/bairros" className={navLinkClass}>
              Bairros
            </Link>
            <Link href="/admin/cidades" className={navLinkClass}>
              Cidades
            </Link>
            <Link href="/admin/construtoras" className={navLinkClass}>
              Construtoras
            </Link>
            <Link href="/admin/leads" className={navLinkClass}>
              Leads
            </Link>
            <Link href="/admin/blog" className={navLinkClass}>
              Blog
            </Link>
          </nav>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:text-zinc-700 md:inline-flex md:items-center md:min-h-[44px]"
          >
            Ver site →
          </Link>

          <form action={logoutAdminAction} className="hidden md:block">
            <button
              type="submit"
              className="rounded-md px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 min-h-[44px]"
            >
              Sair
            </button>
          </form>

          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <X className="h-6 w-6" aria-hidden />
            ) : (
              <Menu className="h-6 w-6" aria-hidden />
            )}
            <span className="sr-only">
              {menuOpen ? "Fechar menu" : "Abrir menu"}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="admin-mobile-menu"
          className="border-t border-zinc-200 bg-white px-4 py-3 shadow-inner md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
            <Link
              href="/admin/imoveis"
              className={`${navLinkClass} -mx-1`}
              onClick={() => setMenuOpen(false)}
            >
              Imóveis
            </Link>
            <Link
              href="/admin/bairros"
              className={`${navLinkClass} -mx-1`}
              onClick={() => setMenuOpen(false)}
            >
              Bairros
            </Link>
            <Link
              href="/admin/cidades"
              className={`${navLinkClass} -mx-1`}
              onClick={() => setMenuOpen(false)}
            >
              Cidades
            </Link>
            <Link
              href="/admin/construtoras"
              className={`${navLinkClass} -mx-1`}
              onClick={() => setMenuOpen(false)}
            >
              Construtoras
            </Link>
            <Link
              href="/admin/leads"
              className={`${navLinkClass} -mx-1`}
              onClick={() => setMenuOpen(false)}
            >
              Leads
            </Link>
            <Link
              href="/admin/blog"
              className={`${navLinkClass} -mx-1`}
              onClick={() => setMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${navLinkClass} -mx-1 text-zinc-500`}
              onClick={() => setMenuOpen(false)}
            >
              Ver site →
            </Link>
            <form action={logoutAdminAction} className="-mx-1">
              <button
                type="submit"
                className={`${navLinkClass} w-full text-left text-zinc-500`}
                onClick={() => setMenuOpen(false)}
              >
                Sair
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
