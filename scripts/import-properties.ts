/**
 * Script de importação de imóveis a partir de arquivo XLS.
 * Executar com: npx tsx scripts/import-properties.ts
 *
 * - Lê ./data/imoveis.xlsx
 * - Transforma e valida cada linha
 * - Upsert por externalId (create ou update)
 * - Processa em batches de 50
 */

import "dotenv/config";
import path from "node:path";
import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import type { PropertyType, TransactionType } from "../lib/generated/prisma/client";
import { slugify } from "../lib/seed/utils";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Linha bruta do XLS (chaves = cabeçalhos) */
type RawRow = Record<string, unknown>;

/** Mapeamento de categoria do XLS para PropertyType */
const CATEGORIA_TO_PROPERTY_TYPE: Record<string, PropertyType> = {
  casa: "CASA",
  casas: "CASA",
  apartamento: "APARTAMENTO",
  apartamentos: "APARTAMENTO",
  cobertura: "COBERTURA",
  coberturas: "COBERTURA",
  terreno: "TERRENO",
  terrenos: "TERRENO",
  comercial: "COMERCIAL",
  comerciais: "COMERCIAL",
  studio: "STUDIO",
  studios: "STUDIO",
  chácara: "CASA",
  chacara: "CASA",
  chácaras: "CASA",
  chacaras: "CASA",
  sala: "COMERCIAL",
  salas: "COMERCIAL",
  galpão: "COMERCIAL",
  galpao: "COMERCIAL",
  galpões: "COMERCIAL",
  galpoes: "COMERCIAL",
  sobrado: "CASA",
  sobrados: "CASA",
  kitnet: "STUDIO",
  kitnets: "STUDIO",
  loft: "APARTAMENTO",
  lofts: "APARTAMENTO",
};

const DEFAULT_PROPERTY_TYPE: PropertyType = "APARTAMENTO";

// ---------------------------------------------------------------------------
// parseXLS
// ---------------------------------------------------------------------------

function parseXLS(filePath: string): RawRow[] {
  const buffer = readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0] ?? "";
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Planilha não encontrada: ${sheetName}`);
  }
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet);
  return rows;
}

// ---------------------------------------------------------------------------
// Helpers de transformação
// ---------------------------------------------------------------------------

function safeString(value: unknown): string {
  if (value == null) return "";
  const s = String(value).trim();
  return s;
}

function safeNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : 0;
}

function parsePrice(value: unknown): number | null {
  const s = safeString(value);
  if (!s) return null;
  // Remove R$, pontos de milhar, converte vírgula decimal
  const cleaned = s
    .replace(/R\s*\$\s*/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseArea(value: unknown): number | null {
  const s = safeString(value);
  if (!s) return null;
  const cleaned = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDate(value: unknown): Date | null {
  const s = safeString(value);
  if (!s) return null;
  // dd/mm/yyyy ou dd/mm/yyyy hh:mm
  const parts = s.split(/[\s/]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10) - 1;
    const year = parseInt(parts[2]!, 10);
    if (Number.isFinite(day) && Number.isFinite(month) && Number.isFinite(year)) {
      const date = new Date(year, month, day);
      if (!Number.isNaN(date.getTime())) return date;
    }
  }
  const parsed = Date.parse(s);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

function mapTransactionType(value: unknown): TransactionType | null {
  const s = safeString(value).toLowerCase();
  if (s.includes("venda")) return "SALE";
  if (s.includes("aluguel") || s.includes("locação") || s.includes("locacao"))
    return "RENT";
  return null;
}

function mapPropertyType(categoria: string): PropertyType {
  const key = categoria.toLowerCase().trim().replace(/\s+/g, "");
  return CATEGORIA_TO_PROPERTY_TYPE[key] ?? DEFAULT_PROPERTY_TYPE;
}

// ---------------------------------------------------------------------------
// transformRow
// ---------------------------------------------------------------------------

type TransformedProperty = {
  title: string;
  description: string | null;
  price: number;
  transactionType: TransactionType;
  propertyTypeSlug: string;
  citySlug: string;
  neighborhoodSlug: string | null;
  type: PropertyType;
  city: string;
  neighborhood: string | null;
  state: string;
  stateSlug: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  area: number | null;
  externalId: string;
  oldUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function transformRow(row: RawRow): TransformedProperty | null {
  const title = safeString(row["Título"]);
  if (!title) return null;

  const price = parsePrice(row["Valor de venda"]);
  if (price == null || price <= 0) return null;

  const transactionType = mapTransactionType(row["Transação"]);
  if (!transactionType) return null;

  const categoria = safeString(row["Categoria"]) || "Apartamento";
  const city = safeString(row["Cidade"]);
  const neighborhoodRaw = safeString(row["Bairro"]);

  if (!city) return null;

  const propertyTypeSlug = slugify(categoria);
  const citySlug = slugify(city);
  const neighborhoodSlug = neighborhoodRaw ? slugify(neighborhoodRaw) : null;

  const areaUtil = parseArea(row["Área útil"]);
  const areaTotal = parseArea(row["Área total"]);
  const area = areaUtil ?? areaTotal;

  const externalIdRaw = safeString(row["Código"]);
  if (!externalIdRaw) return null;

  const oldUrl = safeString(row["Link do imóvel"]) || null;

  const createdAtRaw = parseDate(row["Data"]) ?? parseDate(row["Data de cadastro"]);
  const updatedAtRaw = parseDate(row["Data de alteração"]);
  const now = new Date();
  const createdAt = createdAtRaw ?? now;
  const updatedAt = updatedAtRaw ?? now;

  return {
    title,
    description: safeString(row["Descrição"]) || null,
    price,
    transactionType,
    propertyTypeSlug,
    citySlug,
    neighborhoodSlug,
    type: mapPropertyType(categoria),
    city,
    neighborhood: neighborhoodRaw || null,
    state: "Ceará",
    stateSlug: "ce",
    bedrooms: safeNumber(row["Dormitório"]),
    bathrooms: safeNumber(row["Banheiro"]),
    garage: safeNumber(row["Vagas"]),
    area,
    externalId: externalIdRaw,
    oldUrl,
    createdAt,
    updatedAt,
  };
}

// ---------------------------------------------------------------------------
// upsertProperty
// ---------------------------------------------------------------------------

async function ensureUniqueSlug(
  prisma: PrismaClient,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const existing = await prisma.property.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
}

async function upsertProperty(
  prisma: PrismaClient,
  data: TransformedProperty,
  stats: { created: number; updated: number; errors: number }
): Promise<void> {
  try {
    const existing = await prisma.property.findUnique({
      where: { externalId: data.externalId },
    });

    const baseSlug = slugify(data.title);
    const slug = existing
      ? existing.slug
      : await ensureUniqueSlug(prisma, baseSlug);

    const payload = {
      slug,
      title: data.title,
      description: data.description,
      price: data.price,
      transactionType: data.transactionType,
      type: data.type,
      city: data.city,
      neighborhood: data.neighborhood,
      state: data.state,
      citySlug: data.citySlug,
      neighborhoodSlug: data.neighborhoodSlug,
      stateSlug: data.stateSlug,
      propertyTypeSlug: data.propertyTypeSlug,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      garage: data.garage,
      area: data.area,
      externalId: data.externalId,
      oldUrl: data.oldUrl,
      published: true,
      autoGenerated: false,
      featuredImage: null,
      galleryImages: [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    if (existing) {
      await prisma.property.update({
        where: { id: existing.id },
        data: payload,
      });
      stats.updated++;
    } else {
      await prisma.property.create({ data: payload });
      stats.created++;
    }
  } catch (err) {
    stats.errors++;
    console.error(
      `[ERRO] externalId=${data.externalId} title="${data.title}":`,
      err instanceof Error ? err.message : err
    );
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const BATCH_SIZE = 50;
const XLS_PATH = path.join(process.cwd(), "data", "imoveis.xlsx");

async function main() {
  const connectionString =
    process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL ou DATABASE_URL não encontrada.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const stats = {
    total: 0,
    transformed: 0,
    created: 0,
    updated: 0,
    errors: 0,
  };

  console.log("Lendo arquivo:", XLS_PATH);
  const rawRows = parseXLS(XLS_PATH);
  stats.total = rawRows.length;
  console.log(`Total de linhas no XLS: ${stats.total}`);

  const transformed: TransformedProperty[] = [];
  for (const row of rawRows) {
    const t = transformRow(row);
    if (t) transformed.push(t);
  }
  stats.transformed = transformed.length;
  console.log(`Linhas válidas transformadas: ${stats.transformed}`);

  for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
    const batch = transformed.slice(i, i + BATCH_SIZE);
    for (const item of batch) {
      await upsertProperty(prisma, item, stats);
    }
    console.log(
      `Processados ${Math.min(i + BATCH_SIZE, transformed.length)}/${transformed.length}`
    );
  }

  await prisma.$disconnect();

  console.log("\n--- Resumo ---");
  console.log(`Total processados: ${stats.transformed}`);
  console.log(`Criados: ${stats.created}`);
  console.log(`Atualizados: ${stats.updated}`);
  console.log(`Erros: ${stats.errors}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
