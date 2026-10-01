/**
 * Aplica correções de NOME DE EXIBIÇÃO a partir do CSV revisado (coluna «aprovado»).
 * Slugs NÃO são alterados.
 *
 * NÃO executar sem revisão explícita. Exige --confirm.
 *
 *   pnpm apply:display-names -- --file scripts/output/display-name-corrections.csv --dry-run
 *   pnpm apply:display-names -- --file ... --confirm
 *
 * Revalidação (opcional, com app em execução ou URL de produção):
 *   REVALIDATION_BASE_URL=https://... REVALIDATION_SECRET=... pnpm apply:display-names -- --confirm
 */

import "dotenv/config";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import type { LocationRevalidationPlan } from "../lib/cache/revalidate-location-pages";
import {
  readDisplayNameCsv,
  resolveApprovedDisplayName,
} from "./lib/display-name-csv";

function parseArgs(): {
  filePath: string;
  dryRun: boolean;
  confirm: boolean;
} {
  const fileIdx = process.argv.indexOf("--file");
  const filePath =
    fileIdx >= 0 && process.argv[fileIdx + 1]
      ? process.argv[fileIdx + 1]
      : path.join("scripts", "output", "display-name-corrections.csv");

  return {
    filePath,
    dryRun: process.argv.includes("--dry-run"),
    confirm: process.argv.includes("--confirm"),
  };
}

function mergePlan(
  target: LocationRevalidationPlan,
  partial: Partial<LocationRevalidationPlan>
): void {
  if (partial.citySlugs) target.citySlugs.push(...partial.citySlugs);
  if (partial.neighborhoodSlugs) {
    target.neighborhoodSlugs.push(...partial.neighborhoodSlugs);
  }
  if (partial.propertySlugs) target.propertySlugs.push(...partial.propertySlugs);
  if (partial.stateSlugs) target.stateSlugs.push(...partial.stateSlugs);
}

async function triggerRemoteRevalidation(
  plan: LocationRevalidationPlan
): Promise<void> {
  const baseUrl = process.env.REVALIDATION_BASE_URL?.replace(/\/$/, "");
  const secret = process.env.REVALIDATION_SECRET;

  if (!baseUrl || !secret) {
    console.log(
      "Revalidação: defina REVALIDATION_BASE_URL e REVALIDATION_SECRET para invalidar cache via POST /api/internal/revalidate."
    );
    return;
  }

  const res = await fetch(`${baseUrl}/api/internal/revalidate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Revalidação falhou (${res.status}): ${text}`);
  }

  console.log("Revalidação remota concluída.");
}

async function main(): Promise<void> {
  const { filePath, dryRun, confirm } = parseArgs();

  if (!confirm && !dryRun) {
    console.error(
      "Abortado: use --dry-run para simular ou --confirm para gravar no banco."
    );
    process.exit(1);
  }

  const rows = readDisplayNameCsv(filePath);
  const approved = rows
    .map((row) => ({
      row,
      newName: resolveApprovedDisplayName(row),
    }))
    .filter(
      (entry): entry is { row: (typeof rows)[number]; newName: string } =>
        entry.newName !== null &&
        entry.newName.length > 0 &&
        entry.newName !== entry.row.nome_atual
    );

  if (approved.length === 0) {
    console.log("Nenhuma linha aprovada com alteração pendente.");
    return;
  }

  console.log(
    `${dryRun ? "[dry-run] " : ""}${approved.length} correção(ões) a aplicar.`
  );

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const plan: LocationRevalidationPlan = {
    citySlugs: [],
    neighborhoodSlugs: [],
    propertySlugs: [],
    stateSlugs: [],
  };

  for (const { row, newName } of approved) {
    const { nome_atual: oldName, tipo, estado, cidade } = row;
    console.log(`• [${tipo}] «${oldName}» → «${newName}»`);

    if (tipo === "city") {
      const cityWhere =
        estado.length > 0
          ? { name: oldName, state: estado }
          : { name: oldName };

      const cityRecords = await prisma.city.findMany({
        where: cityWhere,
        select: { slug: true, stateSlug: true },
      });

      const propertyRecords = await prisma.property.findMany({
        where: {
          city: oldName,
          ...(estado ? { state: estado } : {}),
        },
        select: { slug: true, citySlug: true, stateSlug: true },
      });

      mergePlan(plan, {
        citySlugs: cityRecords.map((c) => c.slug),
        stateSlugs: [
          ...cityRecords.map((c) => c.stateSlug),
          ...propertyRecords.map((p) => p.stateSlug),
        ],
        propertySlugs: propertyRecords.map((p) => p.slug),
      });

      if (!dryRun) {
        await prisma.city.updateMany({
          where: cityWhere,
          data: { name: newName },
        });
        await prisma.property.updateMany({
          where: {
            city: oldName,
            ...(estado ? { state: estado } : {}),
          },
          data: { city: newName },
        });
        await prisma.neighborhood.updateMany({
          where: {
            city: oldName,
            ...(estado ? { state: estado } : {}),
          },
          data: { city: newName },
        });
      }
    } else {
      const neighborhoodWhere = {
        name: oldName,
        ...(estado ? { state: estado } : {}),
        ...(cidade ? { city: cidade } : {}),
      };

      const neighborhoodRecords = await prisma.neighborhood.findMany({
        where: neighborhoodWhere,
        select: { slug: true, citySlug: true, stateSlug: true },
      });

      const propertyRecords = await prisma.property.findMany({
        where: {
          neighborhood: oldName,
          ...(estado ? { state: estado } : {}),
          ...(cidade ? { city: cidade } : {}),
        },
        select: {
          slug: true,
          citySlug: true,
          stateSlug: true,
          neighborhoodSlug: true,
        },
      });

      mergePlan(plan, {
        neighborhoodSlugs: [
          ...neighborhoodRecords.map((n) => n.slug),
          ...propertyRecords
            .map((p) => p.neighborhoodSlug)
            .filter((s): s is string => Boolean(s)),
        ],
        citySlugs: [
          ...neighborhoodRecords.map((n) => n.citySlug),
          ...propertyRecords.map((p) => p.citySlug),
        ],
        stateSlugs: [
          ...neighborhoodRecords.map((n) => n.stateSlug),
          ...propertyRecords.map((p) => p.stateSlug),
        ],
        propertySlugs: propertyRecords.map((p) => p.slug),
      });

      if (!dryRun) {
        await prisma.neighborhood.updateMany({
          where: neighborhoodWhere,
          data: { name: newName },
        });
        await prisma.property.updateMany({
          where: {
            neighborhood: oldName,
            ...(estado ? { state: estado } : {}),
            ...(cidade ? { city: cidade } : {}),
          },
          data: { neighborhood: newName },
        });
      }
    }
  }

  await prisma.$disconnect();

  if (dryRun) {
    console.log("Dry-run: nenhuma gravação no banco.");
    return;
  }

  await triggerRemoteRevalidation(plan);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
