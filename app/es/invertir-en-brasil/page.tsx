import type { Metadata } from "next";
import { InvestPageContent } from "@/app/components/InvestPageContent";
import { CONTENT_ES, INVEST_ROUTES } from "@/lib/i18n/invest";
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, BASE_URL } from "@/lib/seo";
import { buildPageTitle, buildPaginatedCanonical, parsePage } from "@/lib/pagination";

const BASE_PATH = "/es/invertir-en-brasil";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePage(sp);
  const paginatedPath = buildPaginatedCanonical(BASE_PATH, page);
  const canonicalCurrent = buildCanonicalUrl(paginatedPath);
  const title = buildPageTitle(CONTENT_ES.seo.title, page);

  return {
    title,
    description: CONTENT_ES.seo.description,
    alternates: {
      canonical: canonicalCurrent,
      languages: {
        pt: `${BASE_URL}${INVEST_ROUTES.pt}`,
        en: `${BASE_URL}${INVEST_ROUTES.en}`,
        fr: `${BASE_URL}${INVEST_ROUTES.fr}`,
        es: canonicalCurrent,
        "x-default": `${BASE_URL}${INVEST_ROUTES.pt}`,
      },
    },
    openGraph: buildOpenGraph({
      title,
      description: CONTENT_ES.seo.description,
      url: canonicalCurrent,
    }),
    twitter: buildTwitterCard({
      title,
      description: CONTENT_ES.seo.description,
    }),
    robots: { index: true, follow: true },
  };
}

export default async function InvertirEnBrasilEsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parsePage(sp);
  return (
    <InvestPageContent
      content={CONTENT_ES}
      page={page}
      basePath={BASE_PATH}
      searchParams={sp}
    />
  );
}
