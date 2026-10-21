-- Aditiva: nome do empreendimento para folder (não altera slug).
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "developmentName" VARCHAR(80);
