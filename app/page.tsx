import type { Metadata } from "next";
import { Header } from "./components/Header";
import { IncomeFilter } from "./components/IncomeFilter";
import { PropertyList } from "./components/PropertyList";
import { ServicesSection } from "./components/ServicesSection";
import { LeadForm } from "./components/LeadForm";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { Footer } from "./components/Footer";
import { getAllPublishedProperties } from "@/lib/queries/properties";
import {
  buildHomePageTitle,
  buildHomePageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
} from "@/lib/seo";

const HOME_PROPERTIES_LIMIT = 12;

export async function generateMetadata(): Promise<Metadata> {
  const title = buildHomePageTitle();
  const description = buildHomePageDescription();
  const canonical = buildCanonicalUrl("/");

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: buildOpenGraph({ title, description, url: canonical }),
    twitter: buildTwitterCard({ title, description }),
    robots: { index: true, follow: true },
  };
}

export default async function Home() {
  const properties = await getAllPublishedProperties(HOME_PROPERTIES_LIMIT);

  return (
    <>
      <Header />
      <IncomeFilter />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            Imóveis em destaque
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {properties.length}{" "}
            {properties.length !== 1 ? "imóveis disponíveis" : "imóvel disponível"}
          </p>
        </div>

        <PropertyList properties={properties} />
      </main>

      <ServicesSection />

      <section
        className="border-t border-zinc-200 bg-zinc-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
        aria-label="Solicitar contato"
      >
        <div className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <LeadForm
            title="Fale com um especialista"
            subtitle="Preencha seus dados e entraremos em contato para entender seu momento, seu perfil e o tipo de imóvel que você procura."
          />
        </div>
      </section>

      <WhatsAppButton />
      <Footer />
    </>
  );
}
