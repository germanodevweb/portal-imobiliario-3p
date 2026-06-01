import type { Metadata } from "next";
import { Header } from "./components/Header";
import { IncomeFilter } from "./components/IncomeFilter";
import { PropertyList } from "./components/PropertyList";
import { GoogleReviewsSection } from "./components/GoogleReviewsSection";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { Footer } from "./components/Footer";
import {
  countHomeListingProperties,
  getHomeListingProperties,
} from "@/lib/queries/properties";
import {
  buildHomePageTitle,
  buildHomePageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
} from "@/lib/seo";
import {
  buildHomeRealEstateAgentJsonLd,
  serializeJsonLd,
} from "@/lib/seo/site-entity-jsonld";
import {
  buildPageTitle,
  buildPaginatedCanonical,
  calculateTotalPages,
  getSkip,
  ITEMS_PER_PAGE,
  parsePage,
} from "@/lib/pagination";
import { Pagination } from "./components/Pagination";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePage(sp);
  const title = buildPageTitle(buildHomePageTitle(), page);
  const description = buildHomePageDescription();
  const canonical = buildCanonicalUrl(buildPaginatedCanonical("/", page));

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: buildOpenGraph({ title, description, url: canonical }),
    twitter: buildTwitterCard({ title, description }),
    robots: { index: true, follow: true },
  };
}

export default async function Home({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const skip = getSkip(page);
  const [properties, count] = await Promise.all([
    getHomeListingProperties(ITEMS_PER_PAGE, skip),
    countHomeListingProperties(),
  ]);
  const totalPages = calculateTotalPages(count);

  const homeLocalJsonLd = serializeJsonLd(buildHomeRealEstateAgentJsonLd());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: homeLocalJsonLd }}
      />
      <Header />
      <IncomeFilter />

      <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:py-12 sm:pb-12 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            Os melhores lançamentos em Fortaleza
          </h1>
        </div>

        <PropertyList properties={properties} />
        <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
      </main>

      <GoogleReviewsSection />

      <WhatsAppButton />
      <Footer />
    </>
  );
}
