import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertySmartSearch } from "@/app/components/PropertySmartSearch";
import { getQuickPropertyTypeLinks } from "@/lib/imoveis/quick-type-links.server";
import {
  getAvailableCities,
  getAvailablePropertyTypes,
} from "@/lib/queries/properties";
import { getPropertyTypeLabel } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Página não encontrada | 3Pinheiros",
  description:
    "O endereço que você acessou não existe ou foi movido. Busque imóveis ou navegue pelas principais cidades e tipos.",
  robots: { index: false, follow: true },
};

const MAX_CITY_LINKS = 8;
const MAX_TYPE_LINKS = 6;

export default async function NotFound() {
  const [cities, propertyTypes, quickTypeLinks] = await Promise.all([
    getAvailableCities(),
    getAvailablePropertyTypes(),
    getQuickPropertyTypeLinks(),
  ]);

  const cityLinks = cities.slice(0, MAX_CITY_LINKS);
  const typeLinks = propertyTypes.slice(0, MAX_TYPE_LINKS);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 pb-24 sm:px-6 sm:py-14 sm:pb-16 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Erro 404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Página não encontrada
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-600">
          O link pode estar desatualizado ou digitado incorretamente. Use a busca abaixo ou escolha
          um atalho para continuar explorando imóveis.
        </p>

        <div className="mt-8">
          <PropertySmartSearch quickTypeLinks={quickTypeLinks} />
        </div>

        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:gap-12">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-800">
              Ver todos os imóveis
            </h2>
            <Link
              href="/imoveis"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-green-700 underline-offset-2 hover:underline"
            >
              Ir para a listagem completa →
            </Link>
          </div>
        </div>

        {cityLinks.length > 0 ? (
          <section className="mt-10" aria-labelledby="not-found-cidades">
            <h2
              id="not-found-cidades"
              className="text-sm font-bold uppercase tracking-wide text-zinc-800"
            >
              Principais cidades
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {cityLinks.map((c) => (
                <li key={c.citySlug}>
                  <Link
                    href={`/cidade/${c.citySlug}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:border-green-600 hover:text-green-800"
                  >
                    {c.city}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {typeLinks.length > 0 ? (
          <section className="mt-8" aria-labelledby="not-found-tipos">
            <h2
              id="not-found-tipos"
              className="text-sm font-bold uppercase tracking-wide text-zinc-800"
            >
              Tipos de imóvel
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {typeLinks.map((t) => (
                <li key={t.propertyTypeSlug}>
                  <Link
                    href={`/tipo/${t.propertyTypeSlug}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:border-green-600 hover:text-green-800"
                  >
                    {getPropertyTypeLabel(t.propertyTypeSlug)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
