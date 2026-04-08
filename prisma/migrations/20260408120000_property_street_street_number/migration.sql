-- Endereço e número no cadastro interno (admin).
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "street" VARCHAR(512);
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "streetNumber" VARCHAR(64);
