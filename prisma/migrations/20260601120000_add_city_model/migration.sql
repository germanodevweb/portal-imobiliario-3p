-- CreateTable: cadastro canônico de cidades (não destrutivo; Property inalterada)
CREATE TABLE "City" (
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

CREATE UNIQUE INDEX "City_normalizedKey_stateSlug_key" ON "City"("normalizedKey", "stateSlug");
CREATE INDEX "City_slug_idx" ON "City"("slug");
CREATE INDEX "City_stateSlug_idx" ON "City"("stateSlug");
CREATE INDEX "City_state_name_idx" ON "City"("state", "name");
