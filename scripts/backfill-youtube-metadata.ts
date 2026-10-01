/**
 * Preenche youtubeTitle, youtubeDescription, youtubePublishedAt e youtubeDurationIso
 * para imóveis publicados com youtubeVideoId (YouTube Data API v3).
 *
 * Executar: pnpm backfill:youtube-metadata
 * Dry-run:  pnpm backfill:youtube-metadata -- --dry-run
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { fetchYouTubeVideoDetailsCore } from "../lib/youtube/fetch-video-details-core";

const dryRun = process.argv.includes("--dry-run");
const BATCH = 25;

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Defina YOUTUBE_API_KEY no .env");
  }

  const connectionString =
    process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL ou DATABASE_URL não encontrada.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const rows = await prisma.property.findMany({
    where: {
      youtubeVideoId: { not: null },
    },
    select: {
      id: true,
      slug: true,
      youtubeVideoId: true,
      youtubeTitle: true,
      youtubePublishedAt: true,
      youtubeDurationIso: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  console.log(
    dryRun ? `[dry-run] ${rows.length} imóveis com vídeo` : `Atualizando ${rows.length} imóveis…`
  );

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    for (const row of batch) {
      const videoId = row.youtubeVideoId?.trim();
      if (!videoId) continue;

      const complete =
        row.youtubeTitle &&
        row.youtubePublishedAt &&
        row.youtubeDurationIso;
      if (complete) {
        skipped += 1;
        continue;
      }

      const details = await fetchYouTubeVideoDetailsCore(videoId, apiKey);
      if (!details) {
        failed += 1;
        console.warn(`Falha API: ${row.slug} (${videoId})`);
        continue;
      }

      if (!dryRun) {
        await prisma.property.update({
          where: { id: row.id },
          data: {
            youtubeTitle: details.title,
            youtubeDescription: details.description || null,
            youtubePublishedAt: details.publishedAt,
            youtubeDurationIso: details.durationIso,
          },
        });
      }
      updated += 1;
      console.log(`${dryRun ? "[dry-run] " : ""}OK ${row.slug}`);
    }
  }

  console.log(
    `Concluído. Atualizados: ${updated}, já completos: ${skipped}, falhas: ${failed}`
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
