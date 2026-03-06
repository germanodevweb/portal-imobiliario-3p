import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import {
  getPropertyBySlug,
  getSimilarProperties,
  getPublishedPropertySlugsForSitemap,
} from "@/lib/queries/properties";
import {
  buildPropertyPageTitle,
  buildPropertyPageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  getPropertyTypeLabel,
  SITE_NAME,
} from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

// ---------------------------------------------------------------------------
// SSG: pré-gera rotas para todos os imóveis publicados
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const slugs = await getPublishedPropertySlugsForSitemap();
  return slugs.map((p) => ({ slug: p.slug }));
}

// ---------------------------------------------------------------------------
// Helpers de formatação — funções puras, sem acesso a banco
// ---------------------------------------------------------------------------

function formatPrice(price: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function transactionLabel(type: "SALE" | "RENT"): string {
  return type === "SALE" ? "Venda" : "Locação";
}

// ---------------------------------------------------------------------------
// Metadata programática por imóvel
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return { title: "Imóvel não encontrado | 3Pinheiros" };
  }

  const title =
    property.metaTitle ?? buildPropertyPageTitle(property.title, property.city);
  const description =
    property.metaDescription ??
    buildPropertyPageDescription(
      property.title,
      property.city,
      property.bedrooms,
      property.price
    );
  const canonical = buildCanonicalUrl(`/imoveis/${slug}`);
  const image = property.ogImage ?? property.featuredImage ?? undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: buildOpenGraph({ title, description, url: canonical, image }),
    twitter: buildTwitterCard({ title, description, image }),
    robots: { index: true, follow: true },
  };
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default async function ImovelPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();

  const similarProperties = await getSimilarProperties({
    currentSlug: slug,
    neighborhoodSlug: property.neighborhoodSlug,
    citySlug: property.citySlug,
    propertyTypeSlug: property.propertyTypeSlug,
  });

  const canonical = buildCanonicalUrl(`/imoveis/${slug}`);
  const formattedPrice = formatPrice(property.price);
  const typeName = getPropertyTypeLabel(property.propertyTypeSlug);
  const txLabel = transactionLabel(property.transactionType);

  // Breadcrumb: Início > Imóveis > Cidade > (Bairro?) > Título
  const breadcrumbItems: { name: string; url: string }[] = [
    { name: "Início", url: buildCanonicalUrl("/") },
    { name: "Imóveis", url: buildCanonicalUrl("/imoveis") },
    { name: property.city, url: buildCanonicalUrl(`/cidade/${property.citySlug}`) },
  ];
  if (property.neighborhoodSlug && property.neighborhood) {
    breadcrumbItems.push({
      name: property.neighborhood,
      url: buildCanonicalUrl(`/bairro/${property.neighborhoodSlug}`),
    });
  }
  breadcrumbItems.push({ name: property.title, url: canonical });

  // -------------------------------------------------------------------------
  // JSON-LD
  // -------------------------------------------------------------------------

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  // RealEstateListing -> WebContent -> CreativeWork -> Thing (Schema.org).
  // NAO e subclasse de Offer. Hierarquia de propriedades:
  //   name, description, url, image  -> Thing
  //   datePosted, contentLocation,
  //   publisher                      -> CreativeWork
  //   offers { Offer }               -> preco, disponibilidade, seller
  const realEstateJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description:
      property.description ??
      `${typeName} para ${txLabel.toLowerCase()} em ${property.city}.`,
    url: canonical,
    ...(property.featuredImage
      ? {
          image: [
            property.featuredImage,
            ...property.galleryImages.slice(0, 5),
          ].filter(Boolean),
        }
      : {}),
    datePosted: property.publishedAt?.toISOString() ?? property.updatedAt.toISOString(),
    contentLocation: {
      "@type": "Place",
      name: property.neighborhood
        ? `${property.neighborhood}, ${property.city}`
        : property.city,
      address: {
        "@type": "PostalAddress",
        addressLocality: property.city,
        addressRegion: property.state,
        addressCountry: "BR",
      },
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: buildCanonicalUrl("/"),
    },
    offers: {
      "@type": "Offer",
      price: Number(property.price),
      priceCurrency: "BRL",
      availability: property.isSold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: canonical,
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
        url: buildCanonicalUrl("/"),
      },
    },
  };

  const videoJsonLd = property.youtubeVideoId
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: `Tour Virtual — ${property.title}`,
        description: `Tour virtual do imóvel ${property.title} em ${property.city}. ${SITE_NAME}.`,
        thumbnailUrl: `https://img.youtube.com/vi/${property.youtubeVideoId}/hqdefault.jpg`,
        contentUrl: `https://www.youtube.com/watch?v=${property.youtubeVideoId}`,
        embedUrl: `https://www.youtube.com/embed/${property.youtubeVideoId}`,
        uploadDate:
          property.publishedAt?.toISOString() ?? property.updatedAt.toISOString(),
      }
    : null;

  return (
    <>
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateJsonLd) }}
      />
      {videoJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Breadcrumb visível */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500"
        >
          {breadcrumbItems.slice(0, -1).map((item, i) => (
            <span key={item.url} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              <Link href={item.url} className="transition-colors hover:text-green-700">
                {item.name}
              </Link>
            </span>
          ))}
          <span aria-hidden="true">/</span>
          <span className="line-clamp-1 font-medium text-zinc-800">
            {property.title}
          </span>
        </nav>

        {/* Imagem principal — priority para LCP */}
        {property.featuredImage && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
            <Image
              src={property.featuredImage}
              alt={`${property.title} — ${property.city}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
              className="object-cover"
            />
            {property.isSold && (
              <div className="absolute left-4 top-4 rounded-full bg-zinc-900/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Vendido
              </div>
            )}
          </div>
        )}

        {/* Galeria de imagens adicionais */}
        {property.galleryImages.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {property.galleryImages.slice(0, 6).map((img, i) => (
              <div
                key={i}
                className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100"
              >
                <Image
                  src={img}
                  alt={`${property.title} — foto ${i + 2}`}
                  fill
                  sizes="(max-width: 640px) 25vw, 15vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Grade principal: conteúdo + sidebar */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">

          {/* Coluna principal — 2/3 */}
          <div className="lg:col-span-2">

            {/* Cabeçalho do imóvel */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  {typeName} • {txLabel}
                </p>
                <h1 className="mt-1 text-2xl font-bold leading-snug tracking-tight text-zinc-900 sm:text-3xl">
                  {property.title}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  {property.neighborhood
                    ? `${property.neighborhood}, ${property.city} — ${property.state}`
                    : `${property.city} — ${property.state}`}
                </p>
              </div>
              <p className="text-2xl font-bold text-green-700 sm:text-3xl">
                {formattedPrice}
              </p>
            </div>

            {/* Métricas principais */}
            <div className="mt-6 flex flex-wrap gap-4 border-y border-zinc-100 py-4">
              {property.area && (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg font-bold text-zinc-900">
                    {property.area}m²
                  </span>
                  <span className="text-xs text-zinc-500">Área</span>
                </div>
              )}
              {property.bedrooms > 0 && (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg font-bold text-zinc-900">
                    {property.bedrooms}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {property.bedrooms !== 1 ? "Quartos" : "Quarto"}
                  </span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg font-bold text-zinc-900">
                    {property.bathrooms}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {property.bathrooms !== 1 ? "Banheiros" : "Banheiro"}
                  </span>
                </div>
              )}
              {property.garage > 0 && (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg font-bold text-zinc-900">
                    {property.garage}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {property.garage !== 1 ? "Vagas" : "Vaga"}
                  </span>
                </div>
              )}
            </div>

            {/* Descrição */}
            {property.description && (
              <div className="mt-6">
                <h2 className="text-base font-semibold text-zinc-900">
                  Sobre o imóvel
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
                  {property.description}
                </p>
              </div>
            )}

            {/* Vídeo YouTube */}
            {property.youtubeVideoId && (
              <div className="mt-8">
                <h2 className="mb-3 text-base font-semibold text-zinc-900">
                  Tour virtual
                </h2>
                <div className="aspect-video w-full overflow-hidden rounded-xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${property.youtubeVideoId}`}
                    title={`Tour virtual — ${property.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    className="h-full w-full border-0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — 1/3 */}
          <aside className="flex flex-col gap-6">

            {/* CTA de contato */}
            <div className="rounded-xl border border-green-100 bg-green-50 p-6">
              <p className="text-sm font-semibold text-zinc-900">
                Interesse neste imóvel?
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Fale com um consultor especializado da 3Pinheiros.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/contato"
                  className="flex items-center justify-center rounded-full bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
                >
                  Solicitar informações
                </Link>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-green-600 px-4 py-2.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
              <p className="mt-4 text-center text-xs text-zinc-400">CRECI 1317J</p>
            </div>

            {/* Links internos — silo: imóvel → cidade, bairro, tipo */}
            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Explorar região
              </p>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href={`/cidade/${property.citySlug}`}
                    className="flex items-center gap-2 text-sm text-zinc-700 transition-colors hover:text-green-700"
                  >
                    <span className="text-green-600">→</span>
                    Imóveis em {property.city}
                  </Link>
                </li>
                {property.neighborhoodSlug && property.neighborhood && (
                  <li>
                    <Link
                      href={`/bairro/${property.neighborhoodSlug}`}
                      className="flex items-center gap-2 text-sm text-zinc-700 transition-colors hover:text-green-700"
                    >
                      <span className="text-green-600">→</span>
                      Imóveis no {property.neighborhood}
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href={`/tipo/${property.propertyTypeSlug}`}
                    className="flex items-center gap-2 text-sm text-zinc-700 transition-colors hover:text-green-700"
                  >
                    <span className="text-green-600">→</span>
                    {typeName} à venda
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/tipo/${property.propertyTypeSlug}/cidade/${property.citySlug}`}
                    className="flex items-center gap-2 text-sm text-zinc-700 transition-colors hover:text-green-700"
                  >
                    <span className="text-green-600">→</span>
                    {typeName} em {property.city}
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Imóveis semelhantes */}
        {similarProperties.length > 0 && (
          <section className="mt-14" aria-label="Imóveis semelhantes">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              Imóveis semelhantes
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {property.neighborhood
                ? `Outros imóveis no ${property.neighborhood} e região.`
                : `Outros imóveis em ${property.city}.`}
            </p>
            <div className="mt-6">
              <PropertyList properties={similarProperties} />
            </div>
          </section>
        )}

        {/* Bloco de contexto semântico */}
        <section
          className="mt-14 rounded-xl bg-green-50 p-6 sm:p-8"
          aria-label="Consultoria 3Pinheiros"
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Consultoria especializada em {property.city}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A 3Pinheiros acompanha todo o processo de compra ou locação: análise
            do imóvel, negociação, financiamento habitacional e assessoria
            jurídica até a entrega das chaves. Atendimento presencial e remoto.
            CRECI 1317J.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contato"
              className="inline-flex items-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              Falar com um consultor
            </Link>
            <Link
              href={`/cidade/${property.citySlug}`}
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              Ver imóveis em {property.city}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
