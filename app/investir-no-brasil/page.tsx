import type { Metadata } from "next";
import { InvestPageContent } from "@/app/components/InvestPageContent";
import { CONTENT_PT, INVEST_ROUTES } from "@/lib/i18n/invest";
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, BASE_URL } from "@/lib/seo";
import { buildPageTitle, buildPaginatedCanonical, parsePage } from "@/lib/pagination";

const canonical = buildCanonicalUrl("/investir-no-brasil");
const BASE_PATH = "/investir-no-brasil";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePage(sp);
  const paginatedPath = buildPaginatedCanonical(BASE_PATH, page);
  const canonicalCurrent = buildCanonicalUrl(paginatedPath);
  const title = buildPageTitle(CONTENT_PT.seo.title, page);

  return {
    title,
    description: CONTENT_PT.seo.description,
    alternates: {
      canonical: canonicalCurrent,
      languages: {
        pt: canonicalCurrent,
        "x-default": canonicalCurrent,
        en: `${BASE_URL}${INVEST_ROUTES.en}`,
        fr: `${BASE_URL}${INVEST_ROUTES.fr}`,
        es: `${BASE_URL}${INVEST_ROUTES.es}`,
      },
    },
    openGraph: buildOpenGraph({
      title,
      description: CONTENT_PT.seo.description,
      url: canonicalCurrent,
    }),
    twitter: buildTwitterCard({
      title,
      description: CONTENT_PT.seo.description,
    }),
    robots: { index: true, follow: true },
  };
}

export default async function InvestirNoBrasilPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parsePage(sp);
  return (
    <InvestPageContent
      content={CONTENT_PT}
      page={page}
      basePath={BASE_PATH}
      searchParams={sp}
    />
  );
}
