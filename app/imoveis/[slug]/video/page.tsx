import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { buildUnpublishedPropertyRedirectPath } from "@/lib/imoveis/property-slug-redirect";
import { loadPropertyVideoWatchPageData } from "@/lib/imoveis/property-video-watch-page";
import {
  getPropertySlugPublicationState,
  getPublishedPropertySlugsWithYouTubeVideo,
} from "@/lib/queries/properties";
import { buildPropertyDetailRobots } from "@/lib/indexation";
import {
  buildCanonicalUrl,
  buildPropertyVideoObjectJsonLd,
  buildTwitterCard,
  buildVideoWatchOpenGraph,
  buildYouTubeEmbedUrl,
} from "@/lib/seo";
import { serializeJsonLd } from "@/lib/seo/site-entity-jsonld";

type PageProps = { params: Promise<{ slug: string }> };

function splitVideoPageParagraphs(text: string): string[] {
  const sentences =
    text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ??
    [text];
  if (sentences.length <= 3) return [sentences.join(" ")];
  const mid = Math.ceil(sentences.length / 2);
  return [
    sentences.slice(0, mid).join(" "),
    sentences.slice(mid).join(" "),
  ];
}

export const revalidate = 120;

export async function generateStaticParams() {
  const slugs = await getPublishedPropertySlugsWithYouTubeVideo();
  return slugs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const publication = await getPropertySlugPublicationState(slug);
  if (publication.status === "missing") {
    return { title: "Vídeo não encontrado | 3Pinheiros" };
  }
  if (publication.status === "unpublished") {
    return { title: "Vídeo indisponível | 3Pinheiros", robots: { index: false, follow: true } };
  }

  const data = await loadPropertyVideoWatchPageData(slug);
  if (!data) {
    return { title: "Vídeo não encontrado | 3Pinheiros" };
  }

  const { property, seo, canonical, metaTitle, metaDescription } = data;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical },
    openGraph: buildVideoWatchOpenGraph({
      title: metaTitle,
      description: metaDescription,
      url: canonical,
      thumbnailUrl: seo.thumbnailUrl,
      embedUrl: seo.embedUrl,
    }),
    twitter: buildTwitterCard({
      title: metaTitle,
      description: metaDescription,
      image: seo.thumbnailUrl,
    }),
    robots: buildPropertyDetailRobots(property.isSold, property.updatedAt),
  };
}

export default async function PropertyVideoWatchPage({ params }: PageProps) {
  const { slug } = await params;
  const publication = await getPropertySlugPublicationState(slug);
  if (publication.status === "missing") notFound();
  if (publication.status === "unpublished") {
    permanentRedirect(buildUnpublishedPropertyRedirectPath(publication.redirect));
  }

  const data = await loadPropertyVideoWatchPageData(slug);
  if (!data) notFound();

  const { property, seo, canonical, detailPath, plainDescription } = data;
  const embedUrl = buildYouTubeEmbedUrl(property.youtubeVideoId);

  const breadcrumbItems = [
    { name: "Início", url: buildCanonicalUrl("/") },
    { name: "Imóveis", url: buildCanonicalUrl("/imoveis") },
    { name: "Imóvel", url: buildCanonicalUrl(detailPath) },
    { name: "Vídeo", url: canonical },
  ];

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

  const videoJsonLd = buildPropertyVideoObjectJsonLd(canonical, seo);

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(videoJsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-8 lg:py-10">
        <h1 className="text-xl font-bold leading-snug tracking-tight text-zinc-900 sm:text-2xl">
          Tour em vídeo: {property.title}
        </h1>

        <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-200/80">
          <iframe
            src={embedUrl}
            title={seo.name}
            width={1280}
            height={720}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>

        {plainDescription ? (
          <div className="mt-6 space-y-3 text-sm leading-relaxed text-zinc-600">
            {splitVideoPageParagraphs(plainDescription).map((paragraph) => (
              <p key={paragraph.slice(0, 64)}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        <p className="mt-8">
          <Link
            href={detailPath}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800 sm:w-auto"
          >
            Ver fotos, preço e detalhes do imóvel
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
