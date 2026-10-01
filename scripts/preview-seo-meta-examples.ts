/**
 * Preview Parte 5 — exemplos antes/depois (somente leitura).
 *   pnpm exec tsx scripts/preview-seo-meta-examples.ts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { SITE_NAME } from "../lib/seo";
import { formatPropertyPriceBrlCompact } from "../lib/utils/property-price";
import {
  buildPropertyPageTitle as newPropertyTitle,
  buildPropertyPageDescription as newPropertyDesc,
  buildCityPageTitle as newCityTitle,
  buildCityPageDescription as newCityDesc,
  buildNeighborhoodPageTitle as newNbTitle,
  buildNeighborhoodPageDescription as newNbDesc,
  buildPropertyTypeListTitle as newTypeTitle,
  buildPropertyTypeListDescription as newTypeDesc,
  buildStatePageTitle as newStateTitle,
} from "../lib/seo-meta";
import { formatPriceShort } from "../lib/seo-primitives";

const OLD_BRAND = ` | ${SITE_NAME}`;

function oldPropertyTitle(title: string, city: string): string {
  return `${title} — ${city}${OLD_BRAND}`;
}

function oldPropertyDesc(
  title: string,
  city: string,
  bedrooms: number,
  price: string
): string {
  const formattedPrice = formatPropertyPriceBrlCompact(price);
  return `${title} em ${city}. ${bedrooms} quarto${bedrooms !== 1 ? "s" : ""}. ${formattedPrice}. Consulte condições com a 3Pinheiros Consultoria Imobiliária.`;
}

function oldCityTitle(city: string): string {
  return `Imóveis à Venda em ${city}${OLD_BRAND}`;
}

function oldCityDesc(city: string, count: number): string {
  const plural = count !== 1 ? "imóveis disponíveis" : "imóvel disponível";
  return `Encontre ${count} ${plural} em ${city}. Casas, apartamentos e coberturas à venda e para locação. Consultoria completa pela 3Pinheiros.`;
}

function oldNbTitle(nb: string, city: string): string {
  return `Imóveis à Venda no ${nb}, ${city}${OLD_BRAND}`;
}

function oldNbDesc(nb: string, city: string, count: number): string {
  const plural = count !== 1 ? "imóveis" : "imóvel";
  return `${count} ${plural} no ${nb}, ${city}. Veja opções de casas e apartamentos com fotos, preços e localização. 3Pinheiros.`;
}

async function main(): Promise<void> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const samples = await prisma.property.findMany({
    where: { published: true, metaTitle: null },
    select: {
      slug: true,
      title: true,
      city: true,
      neighborhood: true,
      propertyTypeSlug: true,
      transactionType: true,
      bedrooms: true,
      area: true,
      areaMin: true,
      areaMax: true,
      price: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const fortalezaTx = (
    await prisma.property.groupBy({
      by: ["transactionType"],
      where: { citySlug: "fortaleza", published: true },
    })
  ).map((r) => r.transactionType);
  const fortalezaCount = await prisma.property.count({
    where: { citySlug: "fortaleza", published: true },
  });
  const fortalezaAgg = await prisma.property.aggregate({
    where: { citySlug: "fortaleza", published: true },
    _min: { price: true },
    _max: { price: true },
  });
  const fortalezaRange =
    fortalezaAgg._min.price && fortalezaAgg._max.price
      ? {
          minPrice: String(fortalezaAgg._min.price),
          maxPrice: String(fortalezaAgg._max.price),
        }
      : null;

  const pecem = await prisma.property.findFirst({
    where: {
      published: true,
      OR: [
        { neighborhood: { contains: "Pecem", mode: "insensitive" } },
        { neighborhood: { contains: "Pecém", mode: "insensitive" } },
      ],
    },
    select: {
      slug: true,
      title: true,
      city: true,
      neighborhood: true,
      propertyTypeSlug: true,
      transactionType: true,
      bedrooms: true,
      area: true,
      areaMin: true,
      areaMax: true,
      price: true,
    },
  });

  console.log("=== 10 EXEMPLOS ANTES / DEPOIS (dados reais) ===\n");

  let n = 0;
  const print = (kind: string, antes: string, depois: string) => {
    n += 1;
    console.log(`${n}. [${kind}]`);
    console.log(`   ANTES (${antes.length}): ${antes}`);
    console.log(`   DEPOIS (${depois.length}): ${depois}\n`);
  };

  for (const p of samples.slice(0, 3)) {
    const fields = {
      propertyTypeSlug: p.propertyTypeSlug,
      transactionType: p.transactionType,
      bedrooms: p.bedrooms,
      area: p.area,
      areaMin: p.areaMin,
      areaMax: p.areaMax,
      neighborhood: p.neighborhood,
      city: p.city,
    };
    print(
      `Title /imoveis/${p.slug}`,
      oldPropertyTitle(p.title, p.city),
      newPropertyTitle(fields)
    );
  }

  if (pecem) {
    const fields = {
      propertyTypeSlug: pecem.propertyTypeSlug,
      transactionType: pecem.transactionType,
      bedrooms: pecem.bedrooms,
      area: pecem.area,
      areaMin: pecem.areaMin,
      areaMax: pecem.areaMax,
      neighborhood: pecem.neighborhood,
      city: pecem.city,
    };
    print(
      `Title Pecém (${pecem.slug})`,
      oldPropertyTitle(pecem.title, pecem.city),
      newPropertyTitle(fields)
    );
    print(
      `Meta desc. Pecém`,
      oldPropertyDesc(
        pecem.title,
        pecem.city,
        pecem.bedrooms,
        String(pecem.price)
      ),
      newPropertyDesc({ ...fields, price: String(pecem.price) })
    );
  }

  print(
    "Cidade Fortaleza (title)",
    oldCityTitle("Fortaleza"),
    newCityTitle("Fortaleza", fortalezaTx)
  );
  print(
    "Cidade Fortaleza (description)",
    oldCityDesc("Fortaleza", fortalezaCount),
    newCityDesc("Fortaleza", fortalezaCount, fortalezaRange, fortalezaTx)
  );

  if (fortalezaRange) {
    console.log(
      `   (faixa Fortaleza: ${formatPriceShort(fortalezaRange.minPrice)} – ${formatPriceShort(fortalezaRange.maxPrice)})`
    );
  }

  const meireles = await prisma.property.findFirst({
    where: {
      published: true,
      neighborhood: { contains: "Meireles", mode: "insensitive" },
    },
    select: { neighborhood: true, city: true },
  });
  if (meireles?.neighborhood) {
    const nbCount = await prisma.property.count({
      where: {
        published: true,
        neighborhood: meireles.neighborhood,
        city: meireles.city,
      },
    });
    print(
      "Bairro Meireles (title)",
      oldNbTitle(meireles.neighborhood, meireles.city),
      newNbTitle(meireles.neighborhood, meireles.city, fortalezaTx)
    );
    print(
      "Bairro Meireles (desc)",
      oldNbDesc(meireles.neighborhood, meireles.city, nbCount),
      newNbDesc(
        meireles.neighborhood,
        meireles.city,
        nbCount,
        fortalezaRange,
        fortalezaTx
      )
    );
  }

  const aptCount = await prisma.property.count({
    where: { propertyTypeSlug: "apartamento", published: true },
  });
  const aptTx = (
    await prisma.property.groupBy({
      by: ["transactionType"],
      where: { propertyTypeSlug: "apartamento", published: true },
    })
  ).map((r) => r.transactionType);
  const aptAgg = await prisma.property.aggregate({
    where: { propertyTypeSlug: "apartamento", published: true },
    _min: { price: true },
    _max: { price: true },
  });
  const aptRange =
    aptAgg._min.price && aptAgg._max.price
      ? { minPrice: String(aptAgg._min.price), maxPrice: String(aptAgg._max.price) }
      : null;

  print(
    "Tipo Apartamentos",
    `Apartamentos à Venda${OLD_BRAND}`,
    newTypeTitle("Apartamentos", aptTx)
  );
  print(
    "Tipo Apartamentos (desc)",
    `${aptCount} imóveis do tipo apartamentos disponíveis com fotos...`,
    newTypeDesc("Apartamentos", aptCount, aptRange, aptTx)
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
