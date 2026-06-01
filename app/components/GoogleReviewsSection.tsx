import Image from "next/image";
import Link from "next/link";
import { Globe, Handshake, Shield } from "lucide-react";
import {
  GOOGLE_BUSINESS_RATING,
  GOOGLE_BUSINESS_REVIEW_COUNT,
  GOOGLE_REVIEW_HIGHLIGHTS,
  INSTITUTIONAL_TEAM_IMAGE,
  resolveGoogleReviewsUrl,
} from "@/lib/constants/google-reviews";

function StarRating({ label }: { label: string }) {
  return (
    <span
      className="text-sm leading-none text-amber-400"
      role="img"
      aria-label={label}
    >
      <span aria-hidden="true">★★★★★</span>
    </span>
  );
}

const reviewCardClasses =
  "flex flex-col rounded-xl border border-zinc-300/80 bg-white p-4 shadow-sm ring-1 ring-zinc-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-5 lg:h-full";

const reviewAvatarSize = 64;

const reviewAvatarClassName =
  "size-16 shrink-0 rounded-full object-cover ring-2 ring-zinc-200";

function GoogleWordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </span>
  );
}

/**
 * Prova social na Home — avaliações Google em HTML indexável (Server Component).
 */
export function GoogleReviewsSection() {
  const googleReviewsUrl = resolveGoogleReviewsUrl();
  const ratingLabel = `${GOOGLE_BUSINESS_RATING.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} de 5 estrelas no Google`;

  return (
    <section
      id="depoimentos"
      aria-labelledby="google-reviews-heading"
      className="bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 sm:text-sm">
            A confiança dos nossos clientes
          </p>
          <h2
            id="google-reviews-heading"
            className="mx-auto mt-2.5 max-w-2xl text-balance text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl md:text-4xl lg:mt-3 lg:text-5xl lg:leading-snug"
          >
            O que nossos clientes dizem sobre a{" "}
            <span className="text-amber-300">3 Pinheiros</span>
          </h2>
          <div className="mt-3 flex justify-center lg:mt-3.5">
            <div
              className="inline-flex w-full max-w-md flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/90 shadow-sm ring-1 ring-white/10 sm:w-auto sm:max-w-none sm:gap-x-3 sm:px-5 sm:py-2.5 sm:text-sm"
              aria-label={`${GOOGLE_BUSINESS_RATING.toLocaleString("pt-BR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })} de 5 estrelas no Google. ${GOOGLE_BUSINESS_REVIEW_COUNT} avaliações verificadas.`}
            >
              <StarRating label={ratingLabel} />
              <span className="font-semibold text-white">
                {GOOGLE_BUSINESS_RATING.toLocaleString("pt-BR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                no Google
              </span>
              <span className="text-emerald-200/50" aria-hidden="true">
                ·
              </span>
              <span>{GOOGLE_BUSINESS_REVIEW_COUNT} avaliações verificadas</span>
            </div>
          </div>
          <p className="mx-auto mt-3 max-w-3xl text-sm font-medium leading-relaxed text-white sm:mt-3.5 sm:text-base md:text-lg md:leading-8">
            Avaliações reais de clientes que compraram, venderam e investiram com
            a 3 Pinheiros.
          </p>
        </header>

        <div className="mt-5 grid grid-cols-1 items-start gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:items-stretch lg:gap-5">
          {GOOGLE_REVIEW_HIGHLIGHTS.map((review) => (
            <article key={review.authorName} className={reviewCardClasses}>
              <header className="flex shrink-0 items-center gap-3">
                <Image
                  src={review.avatarSrc}
                  alt={review.avatarAlt}
                  width={reviewAvatarSize}
                  height={reviewAvatarSize}
                  className={reviewAvatarClassName}
                  sizes={`${reviewAvatarSize}px`}
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-zinc-900">
                    {review.authorName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <StarRating
                      label={`Avaliação de ${review.authorName}: 5 de 5 estrelas`}
                    />
                    <time
                      dateTime={review.publishedAtIso}
                      className="text-sm text-zinc-500"
                    >
                      {review.publishedAtLabel}
                    </time>
                  </div>
                </div>
              </header>
              <blockquote className="mt-3 flex-1 text-base leading-7 text-zinc-700">
                <p>&ldquo;{review.body}&rdquo;</p>
              </blockquote>
              <p className="mt-auto pt-3 text-right text-xs font-semibold sm:text-sm">
                <GoogleWordmark />
              </p>
            </article>
          ))}

          <aside
            className="flex h-full flex-col overflow-hidden rounded-xl border border-emerald-700/60 bg-linear-to-b from-zinc-50 to-white shadow-sm ring-1 ring-emerald-800/30 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:col-span-2 lg:col-span-1"
            aria-label="Equipe 3 Pinheiros"
          >
            <div className="relative aspect-[5/4] w-full shrink-0 bg-zinc-900 sm:aspect-[4/3]">
              <Image
                src={INSTITUTIONAL_TEAM_IMAGE.src}
                alt={INSTITUTIONAL_TEAM_IMAGE.alt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                loading="lazy"
              />
            </div>
            <div className="flex flex-1 flex-col bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950 p-4 sm:p-5">
              <p className="text-base leading-7 text-white/90">
                Corretoria com experiência, ética e compromisso em cada
                negociação.
              </p>
              <ul className="mt-3.5 space-y-2.5 text-sm leading-relaxed text-emerald-50 sm:space-y-3 sm:text-base sm:leading-7">
                <li className="flex items-start gap-2">
                  <Shield
                    className="mt-1 h-4 w-4 shrink-0 text-amber-300"
                    aria-hidden
                  />
                  <span className="font-medium">Transparência e confiança</span>
                </li>
                <li className="flex items-start gap-2">
                  <Handshake
                    className="mt-1 h-4 w-4 shrink-0 text-amber-300"
                    aria-hidden
                  />
                  <span className="font-medium">Atendimento personalizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe
                    className="mt-1 h-4 w-4 shrink-0 text-amber-300"
                    aria-hidden
                  />
                  <span className="font-medium">Atuação nacional e internacional</span>
                </li>
              </ul>
              <div className="mt-auto flex justify-center pt-4">
                <Link
                  href="/quem-somos"
                  className="inline-flex min-h-[44px] w-full max-w-[220px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-amber-300/50 hover:bg-amber-300/15 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900 sm:text-base"
                >
                  Conheça nossa equipe
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <p className="mt-5 text-center sm:mt-6">
          <a
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver todas as avaliações da 3 Pinheiros no Google (abre em nova aba)"
            className="inline-flex min-h-[44px] max-w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-amber-300/50 hover:bg-amber-300/15 hover:text-amber-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900 sm:px-6 sm:text-base md:text-lg"
          >
            Ver todas as avaliações no <GoogleWordmark className="font-semibold" />
            <span aria-hidden="true">→</span>
          </a>
        </p>
      </div>
    </section>
  );
}
