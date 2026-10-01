/**
 * Somente leitura: lista nomes de exibição distintos (Property, City, Neighborhood)
 * e gera CSV com sugestão de correção para revisão manual.
 *
 *   pnpm export:display-names
 *   pnpm export:display-names -- --out scripts/output/display-name-corrections.csv
 */

import "dotenv/config";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import {
  suggestCityDisplayName,
  suggestNeighborhoodDisplayName,
} from "../lib/utils/place-display-name";
import {
  type DisplayNameCsvRow,
  writeDisplayNameCsv,
} from "./lib/display-name-csv";

type RowKey = string;

function buildKey(parts: string[]): RowKey {
  return parts.join("\u0001");
}

function parseArgs(): { outPath: string } {
  const outIdx = process.argv.indexOf("--out");
  const outPath =
    outIdx >= 0 && process.argv[outIdx + 1]
      ? process.argv[outIdx + 1]
      : path.join("scripts", "output", "display-name-corrections.csv");
  return { outPath };
}

async function main(): Promise<void> {
  const { outPath } = parseArgs();
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  type Acc = {
    tipo: "city" | "neighborhood";
    nome_atual: string;
    estado: string;
    cidade: string;
    fontes: Set<string>;
  };

  const acc = new Map<RowKey, Acc>();

  function upsert(
    tipo: "city" | "neighborhood",
    nomeAtual: string,
    estado: string,
    cidade: string,
    fonte: string
  ): void {
    const nome = nomeAtual.trim();
    if (!nome) return;

    const key = buildKey([tipo, nome, estado, cidade]);
    const existing = acc.get(key);
    if (existing) {
      existing.fontes.add(fonte);
      return;
    }

    acc.set(key, {
      tipo,
      nome_atual: nome,
      estado,
      cidade,
      fontes: new Set([fonte]),
    });
  }

  const [propertyCities, propertyNeighborhoods, cities, neighborhoods] =
    await Promise.all([
      prisma.property.findMany({
        distinct: ["city", "state"],
        select: { city: true, state: true },
      }),
      prisma.property.findMany({
        where: { neighborhood: { not: null } },
        distinct: ["neighborhood", "city", "state"],
        select: { neighborhood: true, city: true, state: true },
      }),
      prisma.city.findMany({
        select: { name: true, state: true },
        distinct: ["name", "state"],
      }),
      prisma.neighborhood.findMany({
        select: { name: true, city: true, state: true },
        distinct: ["name", "city", "state"],
      }),
    ]);

  for (const row of propertyCities) {
    upsert("city", row.city, row.state, "", "Property.city");
  }
  for (const row of cities) {
    upsert("city", row.name, row.state, "", "City.name");
  }
  for (const row of propertyNeighborhoods) {
    if (!row.neighborhood) continue;
    upsert(
      "neighborhood",
      row.neighborhood,
      row.state,
      row.city,
      "Property.neighborhood"
    );
  }
  for (const row of neighborhoods) {
    upsert(
      "neighborhood",
      row.name,
      row.state,
      row.city,
      "Neighborhood.name"
    );
  }

  const rows: DisplayNameCsvRow[] = [...acc.values()]
    .map((entry) => {
      const sugestao =
        entry.tipo === "city"
          ? suggestCityDisplayName(entry.nome_atual)
          : suggestNeighborhoodDisplayName(entry.nome_atual);

      return {
        tipo: entry.tipo,
        nome_atual: entry.nome_atual,
        estado: entry.estado,
        cidade: entry.cidade,
        fontes: [...entry.fontes].sort().join("; "),
        sugestao,
        aprovado: sugestao === entry.nome_atual ? "" : "",
      };
    })
    .sort((a, b) => {
      const t = a.tipo.localeCompare(b.tipo, "pt-BR");
      if (t !== 0) return t;
      return a.nome_atual.localeCompare(b.nome_atual, "pt-BR");
    });

  const needsReview = rows.filter((r) => r.sugestao !== r.nome_atual).length;

  writeDisplayNameCsv(outPath, rows);

  console.log(`CSV gerado: ${path.resolve(outPath)}`);
  console.log(`Total de linhas: ${rows.length}`);
  console.log(`Com sugestão diferente do atual: ${needsReview}`);
  console.log(
    "Revise a coluna «aprovado» (sim = aplicar sugestão, ou informe o nome final) e rode apply-display-name-corrections.ts com --confirm."
  );

  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
