-- Metadados do YouTube (Data API) para VideoObject, Open Graph e video sitemap.
ALTER TABLE "Property" ADD COLUMN     "youtubeTitle" TEXT,
ADD COLUMN     "youtubeDescription" TEXT,
ADD COLUMN     "youtubePublishedAt" TIMESTAMP(3),
ADD COLUMN     "youtubeDurationIso" TEXT;
