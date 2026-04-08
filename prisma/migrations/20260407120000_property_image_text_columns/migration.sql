-- URLs Cloudinary e textos longos (alt / ambiente). Idempotente no PostgreSQL.
ALTER TABLE "PropertyImage" ALTER COLUMN "url" TYPE TEXT;
ALTER TABLE "PropertyImage" ALTER COLUMN "alt" TYPE TEXT;
ALTER TABLE "PropertyImage" ALTER COLUMN "environment" TYPE TEXT;
