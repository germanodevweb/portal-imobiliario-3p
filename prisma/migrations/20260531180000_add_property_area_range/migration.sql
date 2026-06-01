-- Faixa de metragem (lançamentos com várias plantas). Campo `area` permanece como fallback legado.
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "areaMin" FLOAT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "areaMax" FLOAT;
