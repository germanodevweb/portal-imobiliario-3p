/** SQL para colar no Supabase SQL Editor quando `pnpm prisma migrate deploy` não alcança o banco. */

export const CITY_MIGRATION_SQL = `-- Cidades — cadastro canônico
CREATE TABLE IF NOT EXISTS "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stateSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "City_normalizedKey_stateSlug_key"
  ON "City"("normalizedKey", "stateSlug");
CREATE INDEX IF NOT EXISTS "City_slug_idx" ON "City"("slug");
CREATE INDEX IF NOT EXISTS "City_stateSlug_idx" ON "City"("stateSlug");
CREATE INDEX IF NOT EXISTS "City_state_name_idx" ON "City"("state", "name");`;

export const NEIGHBORHOOD_MIGRATION_SQL = `-- Bairros — cadastro canônico
CREATE TABLE IF NOT EXISTS "Neighborhood" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "citySlug" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stateSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Neighborhood_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Neighborhood_normalizedKey_citySlug_stateSlug_key"
  ON "Neighborhood"("normalizedKey", "citySlug", "stateSlug");
CREATE INDEX IF NOT EXISTS "Neighborhood_citySlug_idx" ON "Neighborhood"("citySlug");
CREATE INDEX IF NOT EXISTS "Neighborhood_stateSlug_idx" ON "Neighborhood"("stateSlug");
CREATE INDEX IF NOT EXISTS "Neighborhood_slug_idx" ON "Neighborhood"("slug");
CREATE INDEX IF NOT EXISTS "Neighborhood_city_state_idx" ON "Neighborhood"("city", "state");`;

export const BUILDER_MIGRATION_SQL = `-- Construtoras — colunas no imóvel + cadastro canônico
ALTER TABLE "Property"
  ADD COLUMN IF NOT EXISTS "builderName" TEXT,
  ADD COLUMN IF NOT EXISTS "builderSlug" TEXT;
CREATE INDEX IF NOT EXISTS "Property_builderSlug_idx" ON "Property"("builderSlug");
CREATE TABLE IF NOT EXISTS "Builder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Builder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Builder_normalizedKey_key" ON "Builder"("normalizedKey");
CREATE UNIQUE INDEX IF NOT EXISTS "Builder_slug_key" ON "Builder"("slug");
CREATE INDEX IF NOT EXISTS "Builder_slug_idx" ON "Builder"("slug");`;

export const BUILDER_CONTACT_MIGRATION_SQL = `-- Contato da construtora (se a tabela Builder já existir)
ALTER TABLE "Builder" ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE "Builder" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;
ALTER TABLE "Builder" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;`;

export const PROPERTY_AREA_RANGE_MIGRATION_SQL = `-- Faixa de metragem (areaMin/areaMax) — imóveis legados continuam usando area
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "areaMin" FLOAT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "areaMax" FLOAT;`;
