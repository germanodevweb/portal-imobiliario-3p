-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "propertyId" TEXT,
ADD COLUMN     "propertySlug" TEXT,
ADD COLUMN     "sourcePath" TEXT;

-- CreateIndex
CREATE INDEX "Lead_propertyId_idx" ON "Lead"("propertyId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
