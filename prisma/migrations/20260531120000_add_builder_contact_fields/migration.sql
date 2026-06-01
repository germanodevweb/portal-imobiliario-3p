-- AlterTable: contato da construtora (responsável, telefone, e-mail)
ALTER TABLE "Builder" ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE "Builder" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;
ALTER TABLE "Builder" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
