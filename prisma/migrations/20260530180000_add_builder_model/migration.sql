-- AlterTable: construtora no imóvel (uso interno + slug para SEO futuro)
ALTER TABLE "Property" ADD COLUMN "builderName" TEXT,
ADD COLUMN "builderSlug" TEXT;

CREATE INDEX "Property_builderSlug_idx" ON "Property"("builderSlug");

-- CreateTable: cadastro canônico de construtoras
CREATE TABLE "Builder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Builder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Builder_normalizedKey_key" ON "Builder"("normalizedKey");
CREATE UNIQUE INDEX "Builder_slug_key" ON "Builder"("slug");
CREATE INDEX "Builder_slug_idx" ON "Builder"("slug");
