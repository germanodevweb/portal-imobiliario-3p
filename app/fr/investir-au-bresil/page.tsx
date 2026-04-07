import type { Metadata } from "next";
import { InvestPageContent } from "@/app/components/InvestPageContent";
import { CONTENT_FR, INVEST_ROUTES } from "@/lib/i18n/invest";
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, BASE_URL } from "@/lib/seo";
import { buildPageTitle, buildPaginatedCanonical, parsePage } from "@/lib/pagination";

const BASE_PATH = "/fr/investir-au-bresil";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePage(sp);
  const paginatedPath = buildPaginatedCanonical(BASE_PATH, page);
  const canonicalCurrent = buildCanonicalUrl(paginatedPath);
  const title = buildPageTitle(CONTENT_FR.seo.title, page);

  return {
    title,
    description: CONTENT_FR.seo.description,
    alternates: {
      canonical: canonicalCurrent,
      languages: {
        pt: `${BASE_URL}${INVEST_ROUTES.pt}`,
        en: `${BASE_URL}${INVEST_ROUTES.en}`,
        fr: canonicalCurrent,
        es: `${BASE_URL}${INVEST_ROUTES.es}`,
        "x-default": `${BASE_URL}${INVEST_ROUTES.pt}`,
      },
    },
    openGraph: buildOpenGraph({
      title,
      description: CONTENT_FR.seo.description,
      url: canonicalCurrent,
    }),
    twitter: buildTwitterCard({
      title,
      description: CONTENT_FR.seo.description,
    }),
    robots: { index: true, follow: true },
  };
}

export default async function InvestirAuBresilFrPage({ searchParams }: PageProps) {
  const page = parsePage(await searchParams);
  return (
    <InvestPageContent
      content={CONTENT_FR}
      page={page}
      basePath={BASE_PATH}
    />
  );
}
