-- CreateTable: cadastro canônico de bairros (não destrutivo; Property inalterada)
CREATE TABLE "Neighborhood" (
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

CREATE UNIQUE INDEX "Neighborhood_normalizedKey_citySlug_stateSlug_key" ON "Neighborhood"("normalizedKey", "citySlug", "stateSlug");
CREATE INDEX "Neighborhood_citySlug_idx" ON "Neighborhood"("citySlug");
CREATE INDEX "Neighborhood_stateSlug_idx" ON "Neighborhood"("stateSlug");
CREATE INDEX "Neighborhood_slug_idx" ON "Neighborhood"("slug");
CREATE INDEX "Neighborhood_city_state_idx" ON "Neighborhood"("city", "state");
