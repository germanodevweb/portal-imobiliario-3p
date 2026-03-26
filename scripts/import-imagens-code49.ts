/**
 * Script de importação de imagens a partir do XML Code49.
 * Executar com: npx tsx scripts/import-imagens-code49.ts
 *
 * - Lê ./data/banco_de_dados.xml
 * - Extrai CODIGO e URLs de cada <IMOVEL><FOTOS>
 * - Associa imagens aos imóveis via externalId (CODIGO)
 * - Insere em PropertyImage; atualiza featuredImage na primeira
 * - Não duplica imagens; processamento em lotes
 */

import "dotenv/config";
import path from "node:path";
import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

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

function normalizeUrl(raw: string): string | null {
  let u = raw.trim();
  if (!u) return null;
  if (!/\.(jpg|jpeg|png)(?:\?|$)/i.test(u)) return null;
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
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
      select: { id: true, externalId: true, featuredImage: true },
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

      const toInsert = item.urls.filter((u) => !existingSet.has(u.url));
      if (toInsert.length === 0) {
        stats.imagesSkipped += item.urls.length;
        if (!property.featuredImage && item.urls[0]) {
          try {
            await prisma.property.update({
              where: { id: property.id },
              data: { featuredImage: item.urls[0].url },
            });
          } catch {
            stats.errors++;
          }
        }
        continue;
      }

      try {
        const payload = toInsert.map((u, idx) => ({
          propertyId: property.id,
          url: u.url,
          alt: u.legenda,
          sortOrder: existingSet.size + idx,
          isPrimary: existingSet.size === 0 && idx === 0,
        }));

        await prisma.propertyImage.createMany({ data: payload });
        stats.imagesInserted += payload.length;

        if (!property.featuredImage) {
          await prisma.property.update({
            where: { id: property.id },
            data: { featuredImage: item.urls[0].url },
          });
        }
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
