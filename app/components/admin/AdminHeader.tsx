import Image from "next/image";
import Link from "next/link";

/**
 * Cabeçalho da área administrativa.
 * Server Component — links estáticos.
 */
export function AdminHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/admin"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <Image
              src="/logo.png"
              alt="3Pinheiros"
              width={36}
              height={36}
              className="object-contain"
            />
            <div>
              <span className="block text-sm font-semibold text-zinc-900">
                3Pinheiros
              </span>
              <span className="block text-xs text-green-700">
                Painel Admin
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/admin/imoveis"
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              Imóveis
            </Link>
            <Link
              href="/admin/leads"
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              Leads
            </Link>
          </nav>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          Ver site →
        </Link>
      </div>
    </header>
  );
}
