type PropertyYouTubeTourProps = {
  youtubeVideoId: string;
  propertyTitle: string;
};

/**
 * Tour YouTube logo após a galeria — iframe oficial, lazy (Googlebot vê o embed no HTML).
 */
export function PropertyYouTubeTour({
  youtubeVideoId,
  propertyTitle,
}: PropertyYouTubeTourProps) {
  return (
    <section className="mt-8" aria-labelledby="property-youtube-tour-heading">
      <h2
        id="property-youtube-tour-heading"
        className="mb-3 text-base font-semibold text-zinc-900 sm:text-lg"
      >
        Tour virtual
      </h2>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-900/5 ring-1 ring-zinc-200/80">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
          title={`Tour virtual — ${propertyTitle}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="h-full w-full border-0"
        />
      </div>
    </section>
  );
}
