"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

type PropertyNeighborhoodMapProps = {
  neighborhood: string;
  city: string;
  state: string;
};

/**
 * Mapa aproximado do bairro — iframe só após interação (não compete com LCP).
 */
export function PropertyNeighborhoodMap({
  neighborhood,
  city,
  state,
}: PropertyNeighborhoodMapProps) {
  const [showMap, setShowMap] = useState(false);
  const mapQuery = `${neighborhood}, ${city}, ${state}`;
  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`;

  return (
    <section className="mt-8" aria-labelledby="property-neighborhood-map-heading">
      <h2
        id="property-neighborhood-map-heading"
        className="mb-3 text-base font-semibold text-zinc-900 sm:text-lg"
      >
        Mapa do bairro
      </h2>
      <p className="mb-4 text-sm text-zinc-600">
        Localização aproximada de <strong className="font-medium text-zinc-800">{neighborhood}</strong>{" "}
        em {city} — sem endereço exato do imóvel.
      </p>

      {!showMap ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-linear-to-br from-emerald-50 via-zinc-50 to-emerald-100/80 ring-1 ring-zinc-200/90">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(16,185,129,0.08) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(16,185,129,0.08) 24px)",
            }}
          />
          <div className="relative flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <MapPin className="h-10 w-10 text-green-700/80" aria-hidden />
            <p className="max-w-xs text-sm font-medium text-zinc-700">{mapQuery}</p>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              Ver no mapa
            </button>
          </div>
        </div>
      ) : (
        <div className="aspect-[16/10] w-full overflow-hidden rounded-xl ring-1 ring-zinc-200/90">
          <iframe
            src={embedSrc}
            title={`Mapa do bairro ${neighborhood}, ${city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
            allowFullScreen
          />
        </div>
      )}
    </section>
  );
}
