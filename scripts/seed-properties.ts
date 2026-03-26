/**
 * Seed programático de imóveis para o portal imobiliário.
 * Executar com: pnpm seed:properties
 *
 * - Usa DIRECT_URL para conexão direta ao PostgreSQL
 * - Gera imóveis distribuídos em estados, cidades, bairros e tipos
 * - Garante consistência de slugs via lib/seed/data.ts
 * - Não sobrescreve dados existentes (createMany com skipDuplicates)
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../lib/generated/prisma/client";
import {
  SEED_STATES,
  SEED_CITIES,
  SEED_NEIGHBORHOODS,
  SEED_PROPERTY_TYPES,
} from "../lib/seed/data";
import { randomInt, randomPrice, pickRandom } from "../lib/seed/utils";

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const PROPERTIES_PER_COMBINATION = 2; // imóveis por (cidade, bairro, tipo)
const PUBLISHED_RATIO = 0.9; // 90% publicados
const SALE_RATIO = 0.85; // 85% venda, 15% aluguel

// Faixas realistas por tipo
const PRICE_BY_TYPE: Record<string, { min: number; max: number }> = {
  studio: { min: 150_000, max: 450_000 },
  apartamento: { min: 250_000, max: 2_500_000 },
  casa: { min: 400_000, max: 5_000_000 },
  cobertura: { min: 1_500_000, max: 8_000_000 },
  terreno: { min: 80_000, max: 1_500_000 },
  comercial: { min: 300_000, max: 3_000_000 },
};

const BEDROOMS_BY_TYPE: Record<string, { min: number; max: number }> = {
  studio: { min: 0, max: 0 },
  apartamento: { min: 1, max: 4 },
  casa: { min: 2, max: 5 },
  cobertura: { min: 2, max: 5 },
  terreno: { min: 0, max: 0 },
  comercial: { min: 0, max: 0 },
};

const AREA_BY_TYPE: Record<string, { min: number; max: number }> = {
  studio: { min: 25, max: 45 },
  apartamento: { min: 45, max: 180 },
  casa: { min: 80, max: 500 },
  cobertura: { min: 150, max: 400 },
  terreno: { min: 100, max: 1000 },
  comercial: { min: 50, max: 500 },
};

// Placeholder de imagem — determinístico por slug para cache
const PLACEHOLDER_IMAGE = "https://picsum.photos/seed";

function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Geração de imóveis
// ---------------------------------------------------------------------------

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL ou DATABASE_URL não encontrada.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const toCreate: Prisma.PropertyCreateManyInput[] = [];

  for (const city of SEED_CITIES) {
    const state = SEED_STATES.find((s) => s.stateSlug === city.stateSlug);
    if (!state) continue;

    const cityNeighborhoods = SEED_NEIGHBORHOODS.filter(
      (n) => n.citySlug === city.citySlug
    );
    const neighborhoodsToUse =
      cityNeighborhoods.length > 0
        ? cityNeighborhoods
        : [{ citySlug: city.citySlug, neighborhoodSlug: "centro", neighborhood: "Centro" }];

    for (const pt of SEED_PROPERTY_TYPES) {
      for (const neighborhood of neighborhoodsToUse) {
        const neighborhoodSlug = neighborhood.neighborhoodSlug;
        const neighborhoodName = neighborhood.neighborhood;

        for (let i = 0; i < PROPERTIES_PER_COMBINATION; i++) {
          const slug = `imovel-${pt.slug}-${city.citySlug}-${neighborhoodSlug}-${shortId()}`;

          const priceRange = PRICE_BY_TYPE[pt.slug] ?? PRICE_BY_TYPE.apartamento;
          const bedRange = BEDROOMS_BY_TYPE[pt.slug] ?? BEDROOMS_BY_TYPE.apartamento;
          const areaRange = AREA_BY_TYPE[pt.slug] ?? AREA_BY_TYPE.apartamento;

          const bedrooms = bedRange.min === bedRange.max ? bedRange.min : randomInt(bedRange.min, bedRange.max);
          const bathrooms = bedrooms === 0 ? randomInt(1, 2) : randomInt(bedrooms, bedrooms + 2);
          const area = areaRange.min === areaRange.max ? areaRange.min : randomInt(areaRange.min, areaRange.max);

          const price = randomPrice(priceRange.min, priceRange.max);
          const published = Math.random() < PUBLISHED_RATIO;
          const transactionType = Math.random() < SALE_RATIO ? "SALE" : "RENT";

          const typeLabels: Record<string, string> = {
            casa: "Casa",
            apartamento: "Apartamento",
            cobertura: "Cobertura",
            terreno: "Terreno",
            comercial: "Imóvel Comercial",
            studio: "Studio",
          };
          const typeLabel = typeLabels[pt.slug] ?? pt.slug;

          const titles = [
            `${typeLabel} em ${neighborhoodName}`,
            `${typeLabel} à venda em ${neighborhoodName}, ${city.city}`,
            `${typeLabel} com ${bedrooms} quartos em ${neighborhoodName}`,
          ];
          const title = pickRandom(titles);

          toCreate.push({
            slug,
            title,
            description: `${typeLabel} em ${neighborhoodName}, ${city.city}. ${bedrooms} quartos, ${bathrooms} banheiros, ${area}m².`,
            autoGenerated: true,
            transactionType,
            price,
            city: city.city,
            neighborhood: neighborhoodName,
            state: state.state,
            citySlug: city.citySlug,
            neighborhoodSlug,
            stateSlug: city.stateSlug,
            propertyTypeSlug: pt.slug,
            type: pt.type,
            bedrooms,
            bathrooms,
            garage: randomInt(0, 2),
            area,
            featuredImage: `${PLACEHOLDER_IMAGE}/${slug}/800/600`,
            galleryImages: [],
            published,
            publishedAt: published ? new Date() : null,
          });
        }
      }
    }
  }

  const result = await prisma.property.createMany({
    data: toCreate,
    skipDuplicates: true,
  });

  console.log("Seed de imóveis concluído:");
  console.log("  criados:", result.count);
  console.log("  ignorados (slug duplicado):", toCreate.length - result.count);

  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error("Erro no seed de imóveis:", err);
  process.exit(1);
});
