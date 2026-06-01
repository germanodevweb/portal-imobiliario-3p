/**
 * Consolida variações de cidade nos imóveis e popula a tabela City.
 * Ex.: Fortaleza, FORTALEZA, Fortaleza-Ceará → Fortaleza / fortaleza
 *
 * Executar:
 *   pnpm consolidate:cities
 *   pnpm consolidate:cities -- --dry-run
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import {
  cityLocationKeyString,
  formatCityDisplayName,
  parseCityInput,
  resolveCanonicalState,
  slugifyCity,
} from "../lib/utils/city-normalize";

type LocationPair = `${string}::${string}`;

type CanonicalGroup = {
  key: string;
  normalizedKey: string;
  state: string;
  stateSlug: string;
  nameCounts: Map<string, number>;
  propertyIds: string[];
  locationPairs: Set<LocationPair>;
};

function parseArgs(): { dryRun: boolean } {
  return { dryRun: process.argv.includes("--dry-run") };
}

function pickCanonicalName(nameCounts: Map<string, number>): string {
  let bestName = "";
  let bestCount = -1;

  for (const [name, count] of nameCounts.entries()) {
    if (count > bestCount) {
      bestName = name;
      bestCount = count;
    } else if (count === bestCount && name.length > bestName.length) {
      bestName = name;
    }
  }

  return bestName;
}

async function main() {
  const { dryRun } = parseArgs();
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL ou DATABASE_URL não encontrada.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const properties = await prisma.property.findMany({
    select: {
      id: true,
      city: true,
      state: true,
      citySlug: true,
      stateSlug: true,
    },
  });

  console.log(`Imóveis analisados: ${properties.length}`);
  if (dryRun) {
    console.log("Modo dry-run — nenhuma alteração será persistida.\n");
  }

  const groups = new Map<string, CanonicalGroup>();

  for (const property of properties) {
    const { cityName, normalizedKey } = parseCityInput(property.city);
    const { state, stateSlug } = resolveCanonicalState(property.state);

    if (!cityName || !normalizedKey || !state || !stateSlug) {
      continue;
    }

    const key = cityLocationKeyString({ normalizedKey, stateSlug });
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        normalizedKey,
        state,
        stateSlug,
        nameCounts: new Map(),
        propertyIds: [],
        locationPairs: new Set(),
      };
      groups.set(key, group);
    }

    const displayName = formatCityDisplayName(cityName);
    group.nameCounts.set(displayName, (group.nameCounts.get(displayName) ?? 0) + 1);
    group.propertyIds.push(property.id);
    group.locationPairs.add(`${property.citySlug}::${property.stateSlug}`);
  }

  console.log(`Grupos canônicos identificados: ${groups.size}\n`);

  let citiesUpserted = 0;
  let propertiesUpdated = 0;
  let neighborhoodsUpdated = 0;

  for (const group of groups.values()) {
    const canonicalName = pickCanonicalName(group.nameCounts);
    const canonicalSlug = slugifyCity(canonicalName);

    const existingCity = await prisma.city.findUnique({
      where: {
        normalizedKey_stateSlug: {
          normalizedKey: group.normalizedKey,
          stateSlug: group.stateSlug,
        },
      },
      select: { slug: true, name: true, state: true },
    });

    const finalName = existingCity?.name ?? canonicalName;
    const finalSlug = existingCity?.slug ?? canonicalSlug;
    const finalState = existingCity?.state ?? group.state;
    const finalStateSlug = group.stateSlug;

    const variantCount = group.nameCounts.size;
    const slugVariants = group.locationPairs.size;

    if (variantCount > 1 || slugVariants > 1) {
      console.log(
        `• ${finalName} (${finalState}): ${group.propertyIds.length} imóveis, ${variantCount} nomes, ${slugVariants} slugs`
      );
    }

    if (dryRun) continue;

    await prisma.city.upsert({
      where: {
        normalizedKey_stateSlug: {
          normalizedKey: group.normalizedKey,
          stateSlug: finalStateSlug,
        },
      },
      create: {
        name: finalName,
        normalizedKey: group.normalizedKey,
        slug: finalSlug,
        state: finalState,
        stateSlug: finalStateSlug,
      },
      update: {
        name: finalName,
        state: finalState,
      },
    });
    citiesUpserted++;

    const propertyResult = await prisma.property.updateMany({
      where: { id: { in: group.propertyIds } },
      data: {
        city: finalName,
        citySlug: finalSlug,
        state: finalState,
        stateSlug: finalStateSlug,
      },
    });
    propertiesUpdated += propertyResult.count;

    for (const pair of group.locationPairs) {
      const [oldCitySlug, oldStateSlug] = pair.split("::");
      const neighborhoodResult = await prisma.neighborhood.updateMany({
        where: {
          citySlug: oldCitySlug,
          stateSlug: oldStateSlug,
        },
        data: {
          city: finalName,
          citySlug: finalSlug,
          state: finalState,
          stateSlug: finalStateSlug,
        },
      });
      neighborhoodsUpdated += neighborhoodResult.count;
    }
  }

  console.log("\n--- Resumo ---");
  if (dryRun) {
    console.log(`Grupos que seriam consolidados: ${groups.size}`);
    console.log("Execute sem --dry-run para aplicar.");
  } else {
    console.log(`Cidades upsert: ${citiesUpserted}`);
    console.log(`Imóveis atualizados: ${propertiesUpdated}`);
    console.log(`Bairros atualizados: ${neighborhoodsUpdated}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
