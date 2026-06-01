import { prisma } from "@/lib/prisma";

/**
 * Detecta erro Prisma quando coluna/tabela ainda não foi migrada no PostgreSQL.
 */
export function isPendingSchemaMigrationError(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = String((err as { code: unknown }).code);
    if (code === "P2021" || code === "P2022") {
      return true;
    }
  }

  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("does not exist in the current database") ||
    (message.includes("column") && message.includes("does not exist")) ||
    (message.includes("Unknown field") && message.includes("for select")) ||
    message.includes("current transaction is aborted")
  );
}

let propertyBuilderColumnsCache: boolean | null = null;
let propertyAreaRangeColumnsCache: boolean | null = null;
let builderTableCache: boolean | null = null;
let builderContactColumnsCache: boolean | null = null;
let neighborhoodTableCache: boolean | null = null;
let cityTableCache: boolean | null = null;

async function relationExists(
  relation: "columns" | "tables",
  tableName: string,
  columnName?: string
): Promise<boolean> {
  if (relation === "columns" && columnName) {
    const result = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${tableName}
          AND column_name = ${columnName}
      ) AS "exists"
    `;
    return result[0]?.exists ?? false;
  }

  const result = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
    ) AS "exists"
  `;
  return result[0]?.exists ?? false;
}

/** Colunas builderName e builderSlug em Property (migration de construtora). */
export async function hasPropertyBuilderColumns(): Promise<boolean> {
  if (propertyBuilderColumnsCache !== null) {
    return propertyBuilderColumnsCache;
  }

  try {
    const [hasName, hasSlug] = await Promise.all([
      relationExists("columns", "Property", "builderName"),
      relationExists("columns", "Property", "builderSlug"),
    ]);
    // Exige as duas colunas: o update persiste builderName e builderSlug juntos.
    propertyBuilderColumnsCache = hasName && hasSlug;
  } catch {
    propertyBuilderColumnsCache = false;
  }

  return propertyBuilderColumnsCache;
}

/** Tabela Builder (cadastro canônico de construtoras). */
export async function hasBuilderTable(): Promise<boolean> {
  if (builderTableCache !== null) {
    return builderTableCache;
  }

  try {
    builderTableCache = await relationExists("tables", "Builder");
  } catch {
    builderTableCache = false;
  }

  return builderTableCache;
}

/** Colunas areaMin/areaMax em Property (faixa de metragem). */
export async function hasPropertyAreaRangeColumns(): Promise<boolean> {
  if (propertyAreaRangeColumnsCache !== null) {
    return propertyAreaRangeColumnsCache;
  }

  try {
    const [hasMin, hasMax] = await Promise.all([
      relationExists("columns", "Property", "areaMin"),
      relationExists("columns", "Property", "areaMax"),
    ]);
    propertyAreaRangeColumnsCache = hasMin && hasMax;
  } catch {
    propertyAreaRangeColumnsCache = false;
  }

  return propertyAreaRangeColumnsCache;
}

/** Colunas de contato em Builder (contactName, contactPhone, contactEmail). */
export async function hasBuilderContactColumns(): Promise<boolean> {
  if (builderContactColumnsCache !== null) {
    return builderContactColumnsCache;
  }

  if (!(await hasBuilderTable())) {
    builderContactColumnsCache = false;
    return false;
  }

  try {
    builderContactColumnsCache = await relationExists(
      "columns",
      "Builder",
      "contactName"
    );
  } catch {
    builderContactColumnsCache = false;
  }

  return builderContactColumnsCache;
}

/** Tabela Neighborhood (cadastro canônico de bairros). */
export async function hasNeighborhoodTable(): Promise<boolean> {
  if (neighborhoodTableCache !== null) {
    return neighborhoodTableCache;
  }

  try {
    neighborhoodTableCache = await relationExists("tables", "Neighborhood");
  } catch {
    neighborhoodTableCache = false;
  }

  return neighborhoodTableCache;
}

/** Tabela City (cadastro canônico de cidades). */
export async function hasCityTable(): Promise<boolean> {
  if (cityTableCache !== null) {
    return cityTableCache;
  }

  try {
    cityTableCache = await relationExists("tables", "City");
  } catch {
    cityTableCache = false;
  }

  return cityTableCache;
}

/** Invalida cache após migration manual (opcional, dev). */
export function resetSchemaMigrationCache(): void {
  propertyBuilderColumnsCache = null;
  propertyAreaRangeColumnsCache = null;
  builderTableCache = null;
  builderContactColumnsCache = null;
  neighborhoodTableCache = null;
  cityTableCache = null;
}
