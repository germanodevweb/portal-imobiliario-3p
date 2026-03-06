import { Header } from "./components/Header";
import { IncomeFilter } from "./components/IncomeFilter";
import { PropertyList } from "./components/PropertyList";
import { ServicesSection } from "./components/ServicesSection";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { Footer } from "./components/Footer";
import { getAllPublishedProperties } from "@/lib/queries/properties";

export default async function Home() {
  const properties = await getAllPublishedProperties();

  return (
    <>
      <Header />
      <IncomeFilter />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
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
      <WhatsAppButton />
      <Footer />
    </>
  );
}
