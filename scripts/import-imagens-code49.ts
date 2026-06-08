/**
 * Script de importação de imagens a partir do XML Code49.
 * Executar com: npx tsx scripts/import-imagens-code49.ts
 *
 * - Lê ./data/banco_de_dados.xml
 * - Extrai CODIGO e URLs de cada <IMOVEL><FOTOS>
 * - Associa imagens aos imóveis via externalId (CODIGO)
 * - Insere em PropertyImage; sincroniza Property.featuredImage, featuredImageAlt e galleryImages
 * - Não duplica imagens; processamento em lotes
 */

import "dotenv/config";
import path from "node:path";
import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import {
  normalizePropertyImagePrimaryBySortOrder,
  syncPropertyGalleryFieldsFromImages,
} from "../lib/property/sync-gallery-fields";
import {
  generateFeaturedImageAlt,
  inferEnvironmentFromText,
} from "../lib/utils/featuredImageAlt";

const XML_PATH = path.join(process.cwd(), "data", "banco_de_dados.xml");
const BATCH_SIZE = 100;

// ---------------------------------------------------------------------------
// Parsing do XML
// ---------------------------------------------------------------------------

type ImovelFotos = {
  codigo: string;
  urls: { url: string; legenda: string | null }[];
};

/**
 * Extrai blocos <IMOVEL>...</IMOVEL> e, para cada um, CODIGO e lista de FOTO/URL.
 * Usa regex para evitar dependência de parser XML; estrutura do Code49 é previsível.
 */
function parseXmlImoveis(content: string): ImovelFotos[] {
  const result: ImovelFotos[] = [];
  const imovelRegex = /<IMOVEL>([\s\S]*?)<\/IMOVEL>/gi;
  let m: RegExpExecArray | null;

  while ((m = imovelRegex.exec(content)) !== null) {
    const block = m[1];
    const codigoMatch = block.match(/<CODIGO>([^<]*)<\/CODIGO>/);
    const codigo = codigoMatch?.[1]?.trim();
    if (!codigo) continue;

    const urls: { url: string; legenda: string | null }[] = [];
    const fotoRegex = /<FOTO>([\s\S]*?)<\/FOTO>/gi;
    let fm: RegExpExecArray | null;
    while ((fm = fotoRegex.exec(block)) !== null) {
      const fotoBlock = fm[1];
      const urlMatch = fotoBlock.match(/<URL>([^<]*)<\/URL>/);
      const url = urlMatch?.[1]?.trim();
      if (!url) continue;

      const legendaMatch = fotoBlock.match(/<LEGENDA><!\[CDATA\[([\s\S]*?)\]\]><\/LEGENDA>/);
      const legendaRaw = legendaMatch?.[1]?.trim();
      const legenda = legendaRaw && legendaRaw.length > 0 ? legendaRaw : null;

      const normalized = normalizeUrl(url);
      if (normalized) urls.push({ url: normalized, legenda });
    }

    if (urls.length > 0) result.push({ codigo, urls });
  }

  return result;
}

/**
 * Normaliza URL da Code49 para o formato salvo no banco.
 * - Protocolo relativo //host → https://host
 * - Sem esquema → https (www. quando aplicável)
 */
function normalizeUrl(raw: string): string | null {
  let u = raw.trim();
  if (!u) return null;
  if (!/\.(jpg|jpeg|png)(?:\?|$)/i.test(u)) return null;

  if (u.startsWith("//")) {
    u = `https:${u}`;
  } else if (!u.startsWith("http://") && !u.startsWith("https://")) {
    u = u.startsWith("www.") ? `https://${u}` : `https://www.${u}`;
  }

  return u;
}

// ---------------------------------------------------------------------------
// Importação
// ---------------------------------------------------------------------------

async function main() {
  const connectionString =
    process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL ou DATABASE_URL não encontrada.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const stats = {
    imoveisParsed: 0,
    imoveisMatched: 0,
    imoveisSkipped: 0,
    imagesInserted: 0,
    imagesSkipped: 0,
    errors: 0,
  };

  console.log("Lendo XML:", XML_PATH);
  const content = readFileSync(XML_PATH, "utf-8");
  const imoveis = parseXmlImoveis(content);
  stats.imoveisParsed = imoveis.length;
  console.log(`Imóveis com fotos no XML: ${imoveis.length}`);

  for (let i = 0; i < imoveis.length; i += BATCH_SIZE) {
    const batch = imoveis.slice(i, i + BATCH_SIZE);
    const codigos = batch.map((b) => b.codigo);

    const properties = await prisma.property.findMany({
      where: { externalId: { in: codigos } },
      select: {
        id: true,
        externalId: true,
        type: true,
        city: true,
        neighborhood: true,
        transactionType: true,
      },
    });
    const propByCodigo = new Map(properties.map((p) => [p.externalId ?? "", p]));

    for (const item of batch) {
      const property = propByCodigo.get(item.codigo);
      if (!property) {
        stats.imoveisSkipped++;
        continue;
      }
      stats.imoveisMatched++;

      const existingUrls = await prisma.propertyImage.findMany({
        where: { propertyId: property.id },
        select: { url: true },
      });
      const existingSet = new Set(existingUrls.map((e) => e.url));

      const firstUrl = item.urls[0]?.url ?? "";

      const toInsert = item.urls.filter((u) => !existingSet.has(u.url));
      if (toInsert.length === 0) {
        stats.imagesSkipped += item.urls.length;
        try {
          await normalizePropertyImagePrimaryBySortOrder(prisma, property.id);
          await syncPropertyGalleryFieldsFromImages(prisma, property.id);
        } catch {
          stats.errors++;
        }
        continue;
      }

      try {
        const payload = toInsert.map((u) => {
          const sortOrder = Math.max(
            0,
            item.urls.findIndex((x) => x.url === u.url)
          );

          let alt = u.legenda;
          let environment: string | null = null;

          if (alt?.trim()) {
            environment = inferEnvironmentFromText(alt);
          } else {
            environment = inferEnvironmentFromText(u.url);
            if (environment) {
              alt = generateFeaturedImageAlt({
                type: property.type,
                neighborhood: property.neighborhood ?? "",
                city: property.city,
                environment,
                transactionType: property.transactionType,
              });
            }
          }

          return {
            propertyId: property.id,
            url: u.url,
            alt: alt?.trim() ? alt.trim() : null,
            environment,
            sortOrder,
            isPrimary: u.url === firstUrl,
          };
        });

        await prisma.propertyImage.createMany({ data: payload });
        stats.imagesInserted += payload.length;

        await normalizePropertyImagePrimaryBySortOrder(prisma, property.id);
        await syncPropertyGalleryFieldsFromImages(prisma, property.id);
      } catch (err) {
        stats.errors++;
        console.error(
          `[ERRO] externalId=${item.codigo}:`,
          err instanceof Error ? err.message : err
        );
      }
    }

    console.log(
      `Processados ${Math.min(i + BATCH_SIZE, imoveis.length)}/${imoveis.length} imóveis`
    );
  }

  await prisma.$disconnect();

  console.log("\n--- Resumo ---");
  console.log(`Imóveis no XML (com fotos): ${stats.imoveisParsed}`);
  console.log(`Imóveis encontrados no banco: ${stats.imoveisMatched}`);
  console.log(`Imóveis sem correspondência: ${stats.imoveisSkipped}`);
  console.log(`Imagens inseridas: ${stats.imagesInserted}`);
  console.log(`Imagens já existentes (ignoradas): ${stats.imagesSkipped}`);
  console.log(`Erros: ${stats.errors}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
