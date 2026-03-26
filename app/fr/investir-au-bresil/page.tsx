import type { Metadata } from "next";
import { InvestPageContent } from "@/app/components/InvestPageContent";
import { CONTENT_FR, INVEST_ROUTES } from "@/lib/i18n/invest";
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, BASE_URL } from "@/lib/seo";

const canonical = buildCanonicalUrl("/fr/investir-au-bresil");

export const metadata: Metadata = {
  title: CONTENT_FR.seo.title,
  description: CONTENT_FR.seo.description,
  alternates: {
    canonical,
    languages: {
      "pt": `${BASE_URL}${INVEST_ROUTES.pt}`,
      "en": `${BASE_URL}${INVEST_ROUTES.en}`,
      "fr": canonical,
      "es": `${BASE_URL}${INVEST_ROUTES.es}`,
      "x-default": `${BASE_URL}${INVEST_ROUTES.pt}`,
    },
  },
  openGraph: buildOpenGraph({
    title: CONTENT_FR.seo.title,
    description: CONTENT_FR.seo.description,
    url: canonical,
  }),
  twitter: buildTwitterCard({
    title: CONTENT_FR.seo.title,
    description: CONTENT_FR.seo.description,
  }),
  robots: { index: true, follow: true },
};

export default function InvestirAuBresilFrPage() {
  return <InvestPageContent content={CONTENT_FR} />;
}
