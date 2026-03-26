import type { Metadata } from "next";
import { InvestPageContent } from "@/app/components/InvestPageContent";
import { CONTENT_ES, INVEST_ROUTES } from "@/lib/i18n/invest";
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, BASE_URL } from "@/lib/seo";

const canonical = buildCanonicalUrl("/es/invertir-en-brasil");

export const metadata: Metadata = {
  title: CONTENT_ES.seo.title,
  description: CONTENT_ES.seo.description,
  alternates: {
    canonical,
    languages: {
      "pt": `${BASE_URL}${INVEST_ROUTES.pt}`,
      "en": `${BASE_URL}${INVEST_ROUTES.en}`,
      "fr": `${BASE_URL}${INVEST_ROUTES.fr}`,
      "es": canonical,
      "x-default": `${BASE_URL}${INVEST_ROUTES.pt}`,
    },
  },
  openGraph: buildOpenGraph({
    title: CONTENT_ES.seo.title,
    description: CONTENT_ES.seo.description,
    url: canonical,
  }),
  twitter: buildTwitterCard({
    title: CONTENT_ES.seo.title,
    description: CONTENT_ES.seo.description,
  }),
  robots: { index: true, follow: true },
};

export default function InvertirEnBrasilEsPage() {
  return <InvestPageContent content={CONTENT_ES} />;
}
