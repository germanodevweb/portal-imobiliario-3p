import type { Metadata } from "next";
import { InvestPageContent } from "@/app/components/InvestPageContent";
import { CONTENT_EN, INVEST_ROUTES } from "@/lib/i18n/invest";
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, BASE_URL } from "@/lib/seo";
import { buildPageTitle, buildPaginatedCanonical, parsePage } from "@/lib/pagination";

const BASE_PATH = "/en/invest-in-brazil";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePage(sp);
  const paginatedPath = buildPaginatedCanonical(BASE_PATH, page);
  const canonicalCurrent = buildCanonicalUrl(paginatedPath);
  const title = buildPageTitle(CONTENT_EN.seo.title, page);

  return {
    title,
    description: CONTENT_EN.seo.description,
    alternates: {
      canonical: canonicalCurrent,
      languages: {
        pt: `${BASE_URL}${INVEST_ROUTES.pt}`,
        en: canonicalCurrent,
        fr: `${BASE_URL}${INVEST_ROUTES.fr}`,
        es: `${BASE_URL}${INVEST_ROUTES.es}`,
        "x-default": `${BASE_URL}${INVEST_ROUTES.pt}`,
      },
    },
    openGraph: buildOpenGraph({
      title,
      description: CONTENT_EN.seo.description,
      url: canonicalCurrent,
    }),
    twitter: buildTwitterCard({
      title,
      description: CONTENT_EN.seo.description,
    }),
    robots: { index: true, follow: true },
  };
}

export default async function InvestInBrazilEnPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parsePage(sp);
  return (
    <InvestPageContent
      content={CONTENT_EN}
      page={page}
      basePath={BASE_PATH}
      searchParams={sp}
    />
  );
}
