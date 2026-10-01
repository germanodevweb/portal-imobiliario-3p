import fs from "node:fs";
import path from "node:path";

export type DisplayNameCsvRow = {
  tipo: "city" | "neighborhood";
  nome_atual: string;
  estado: string;
  cidade: string;
  fontes: string;
  sugestao: string;
  aprovado: string;
};

export const DISPLAY_NAME_CSV_HEADERS: (keyof DisplayNameCsvRow)[] = [
  "tipo",
  "nome_atual",
  "estado",
  "cidade",
  "fontes",
  "sugestao",
  "aprovado",
];

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function writeDisplayNameCsv(
  filePath: string,
  rows: DisplayNameCsvRow[]
): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  const lines = [
    DISPLAY_NAME_CSV_HEADERS.join(","),
    ...rows.map((row) =>
      DISPLAY_NAME_CSV_HEADERS.map((h) => escapeCsvField(row[h])).join(",")
    ),
  ];

  fs.writeFileSync(filePath, `\uFEFF${lines.join("\r\n")}\r\n`, "utf8");
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

export function readDisplayNameCsv(filePath: string): DisplayNameCsvRow[] {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const header = parseCsvLine(lines[0]);
  const rows: DisplayNameCsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const fields = parseCsvLine(lines[i]);
    const record: Record<string, string> = {};
    for (let j = 0; j < header.length; j += 1) {
      record[header[j]] = fields[j] ?? "";
    }

    const tipo = record.tipo?.trim();
    if (tipo !== "city" && tipo !== "neighborhood") {
      continue;
    }

    rows.push({
      tipo,
      nome_atual: record.nome_atual?.trim() ?? "",
      estado: record.estado?.trim() ?? "",
      cidade: record.cidade?.trim() ?? "",
      fontes: record.fontes?.trim() ?? "",
      sugestao: record.sugestao?.trim() ?? "",
      aprovado: record.aprovado?.trim() ?? "",
    });
  }

  return rows;
}

const APPROVE_TOKENS = new Set(["sim", "s", "yes", "y", "1", "x", "ok"]);

/** Valor final a gravar no banco, ou null se a linha não foi aprovada. */
export function resolveApprovedDisplayName(row: DisplayNameCsvRow): string | null {
  const aprovado = row.aprovado.trim();
  if (!aprovado) return null;

  const lower = aprovado.toLocaleLowerCase("pt-BR");
  if (APPROVE_TOKENS.has(lower)) {
    return row.sugestao.trim() || null;
  }

  return aprovado;
}
