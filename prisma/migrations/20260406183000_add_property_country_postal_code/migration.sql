-- Localização extra no cadastro (admin + JSON-LD). Idempotente no PostgreSQL 9.1+.
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
