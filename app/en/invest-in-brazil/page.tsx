import type { Metadata } from "next";
import { InvestPageContent } from "@/app/components/InvestPageContent";
import { CONTENT_EN, INVEST_ROUTES } from "@/lib/i18n/invest";
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, BASE_URL } from "@/lib/seo";

const canonical = buildCanonicalUrl("/en/invest-in-brazil");

export const metadata: Metadata = {
  title: CONTENT_EN.seo.title,
  description: CONTENT_EN.seo.description,
  alternates: {
    canonical,
    languages: {
      "pt": `${BASE_URL}${INVEST_ROUTES.pt}`,
      "en": canonical,
      "fr": `${BASE_URL}${INVEST_ROUTES.fr}`,
      "es": `${BASE_URL}${INVEST_ROUTES.es}`,
      "x-default": `${BASE_URL}${INVEST_ROUTES.pt}`,
    },
  },
  openGraph: buildOpenGraph({
    title: CONTENT_EN.seo.title,
    description: CONTENT_EN.seo.description,
    url: canonical,
  }),
  twitter: buildTwitterCard({
    title: CONTENT_EN.seo.title,
    description: CONTENT_EN.seo.description,
  }),
  robots: { index: true, follow: true },
};

export default function InvestInBrazilEnPage() {
  return <InvestPageContent content={CONTENT_EN} />;
}
