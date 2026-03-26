import type { Metadata } from "next";
import { InvestPageContent } from "@/app/components/InvestPageContent";
import { CONTENT_PT, INVEST_ROUTES } from "@/lib/i18n/invest";
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, BASE_URL } from "@/lib/seo";

const canonical = buildCanonicalUrl("/investir-no-brasil");

export const metadata: Metadata = {
  title: CONTENT_PT.seo.title,
  description: CONTENT_PT.seo.description,
  alternates: {
    canonical,
    languages: {
      "pt": canonical,
      "x-default": canonical,
      "en": `${BASE_URL}${INVEST_ROUTES.en}`,
      "fr": `${BASE_URL}${INVEST_ROUTES.fr}`,
      "es": `${BASE_URL}${INVEST_ROUTES.es}`,
    },
  },
  openGraph: buildOpenGraph({
    title: CONTENT_PT.seo.title,
    description: CONTENT_PT.seo.description,
    url: canonical,
  }),
  twitter: buildTwitterCard({
    title: CONTENT_PT.seo.title,
    description: CONTENT_PT.seo.description,
  }),
  robots: { index: true, follow: true },
};

export default function InvestirNoBrasilPage() {
  return <InvestPageContent content={CONTENT_PT} />;
}
