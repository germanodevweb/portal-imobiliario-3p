/**
 * Conta URLs do sitemap (legado vs indexável). Uso: node scripts/count-sitemap-urls.mjs
 * Requer DATABASE_URL no .env (carregado via prisma config).
 */
import { config } from "dotenv";
import { PrismaClient } from "../lib/generated/prisma/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

config();

const STATIC_ROUTES = 10;

const INDEXATION_THRESHOLDS = {
  state: 1,
  stateCity: 1,
  city: 1,
  neighborhood: 2,
  propertyType: 1,
  propertyTypeCity: 1,
  neighborhoodType: 2,
  cityNeighborhood: 2,
  buyTypeCity: 1,
  buyTypeCityNeighborhood: 2,
};

function shouldIndex(pageType, count) {
  if (count === 0) return false;
  return count >= INDEXATION_THRESHOLDS[pageType];
}

function soldCutoff() {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function legacyPropertyCount() {
  return prisma.property.count({ where: { published: true } });
}

async function indexablePropertyCount() {
  const cutoff = soldCutoff();
  return prisma.property.count({
    where: {
      published: true,
      OR: [{ isSold: false }, { isSold: true, updatedAt: { gte: cutoff } }],
    },
  });
}

async function groupFilter(pageType, groupBy, where) {
  const rows = await prisma.property.groupBy({
    by: groupBy,
    where,
    _count: { _all: true },
  });
  return rows.filter((r) => shouldIndex(pageType, r._count._all)).length;
}

async function legacyGroupCount(where, groupBy) {
  const rows = await prisma.property.groupBy({
    by: groupBy,
    where,
    _count: { _all: true },
  });
  return rows.filter((r) => r._count._all > 0).length;
}

async function blogCount() {
  return prisma.post.count({ where: { published: true } });
}

async function main() {
  const published = { published: true };
  const publishedSale = { published: true, transactionType: "SALE" };
  const withNeighborhood = { ...published, neighborhoodSlug: { not: null } };

  const legacyProgrammatic =
    (await legacyGroupCount(published, ["stateSlug"])) +
    (await legacyGroupCount(published, ["stateSlug", "citySlug"])) +
    (await legacyGroupCount(published, ["citySlug"])) +
    (await legacyGroupCount(withNeighborhood, ["neighborhoodSlug"])) +
    (await legacyGroupCount(published, ["propertyTypeSlug"])) +
    (await legacyGroupCount(published, ["propertyTypeSlug", "citySlug"])) +
    (await legacyGroupCount(withNeighborhood, ["neighborhoodSlug", "propertyTypeSlug"])) +
    (await legacyGroupCount(withNeighborhood, ["citySlug", "neighborhoodSlug"])) +
    (await legacyGroupCount(publishedSale, ["propertyTypeSlug", "citySlug"])) +
    (await legacyGroupCount(withNeighborhood, [
      "propertyTypeSlug",
      "citySlug",
      "neighborhoodSlug",
    ]));

  const indexableProgrammatic =
    (await groupFilter("state", ["stateSlug"], published)) +
    (await groupFilter("stateCity", ["stateSlug", "citySlug"], published)) +
    (await groupFilter("city", ["citySlug"], published)) +
    (await groupFilter("neighborhood", ["neighborhoodSlug"], withNeighborhood)) +
    (await groupFilter("propertyType", ["propertyTypeSlug"], published)) +
    (await groupFilter("propertyTypeCity", ["propertyTypeSlug", "citySlug"], published)) +
    (await groupFilter("neighborhoodType", ["neighborhoodSlug", "propertyTypeSlug"], withNeighborhood)) +
    (await groupFilter("cityNeighborhood", ["citySlug", "neighborhoodSlug"], withNeighborhood)) +
    (await groupFilter("buyTypeCity", ["propertyTypeSlug", "citySlug"], publishedSale)) +
    (await groupFilter("buyTypeCityNeighborhood", ["propertyTypeSlug", "citySlug", "neighborhoodSlug"], {
      ...publishedSale,
      neighborhoodSlug: { not: null },
    }));

  const posts = await blogCount();
  const legacyProperties = await legacyPropertyCount();
  const indexableProperties = await indexablePropertyCount();

  const legacyTotal = STATIC_ROUTES + legacyProgrammatic + posts + legacyProperties;
  const indexableTotal =
    STATIC_ROUTES + indexableProgrammatic + posts + indexableProperties;

  console.log(`Sitemap URLs (legado): ${legacyTotal}`);
  console.log(`Sitemap URLs (novo — evaluateIndexation + vendidos ≤90d): ${indexableTotal}`);
  console.log(`Removidas: ${legacyTotal - indexableTotal}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
