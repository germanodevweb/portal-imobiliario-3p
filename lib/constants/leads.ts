/**
 * Constantes de leads — uso administrativo (/admin).
 * Base reutilizável para labels, cores de status e origem.
 * Não exposto no portal público.
 *
 * Valores alinhados aos enums LeadOrigin e LeadStatus do Prisma.
 */

// ---------------------------------------------------------------------------
// Labels para exibição no admin
// ---------------------------------------------------------------------------

export const LEAD_ORIGIN_LABELS: Record<"site" | "manual", string> = {
  site: "Site",
  manual: "Manual",
} as const;

// — Opções de origem manual (Instagram, Indicação)
export const MANUAL_SOURCE_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "indicacao", label: "Indicação" },
] as const;

export type ManualSource = (typeof MANUAL_SOURCE_OPTIONS)[number]["value"];

/** Label completo da origem (inclui manualSource quando manual) */
export function getOriginDisplayLabel(
  origin: "site" | "manual",
  manualSource: string | null
): string {
  if (origin === "site") return "Site";
  if (origin === "manual" && manualSource === "instagram") return "Manual - Instagram";
  if (origin === "manual" && manualSource === "indicacao") return "Manual - Indicação";
  return "Manual";
}

export const LEAD_STATUS_LABELS: Record<
  "novo" | "em_contato" | "qualificado" | "vendido" | "perdido",
  string
> = {
  novo: "Novo",
  em_contato: "Em contato",
  qualificado: "Qualificado",
  vendido: "Vendido",
  perdido: "Perdido",
} as const;

// ---------------------------------------------------------------------------
// Cores de status — Tailwind classes para uso futuro na UI do admin
// novo → cinza | em_contato → amarelo | qualificado → azul | vendido → esmeralda | perdido → vermelho
// ---------------------------------------------------------------------------

export const LEAD_STATUS_COLORS: Record<
  "novo" | "em_contato" | "qualificado" | "vendido" | "perdido",
  string
> = {
  novo: "bg-zinc-100 text-zinc-700",
  em_contato: "bg-amber-100 text-amber-800",
  qualificado: "bg-blue-100 text-blue-800",
  vendido: "bg-emerald-100 text-emerald-800",
  perdido: "bg-red-100 text-red-800",
} as const;

// ---------------------------------------------------------------------------
// Faixas de valor — opções para formulário (admin e site público)
// ---------------------------------------------------------------------------

export const LEAD_PRICE_RANGE_OPTIONS = [
  { value: "Até R$ 300 mil", label: "Até R$ 300 mil" },
  { value: "R$ 300 mil a R$ 500 mil", label: "R$ 300 mil a R$ 500 mil" },
  { value: "R$ 500 mil a R$ 800 mil", label: "R$ 500 mil a R$ 800 mil" },
  { value: "R$ 800 mil a R$ 1,5 milhão", label: "R$ 800 mil a R$ 1,5 milhão" },
  { value: "Acima de R$ 1,5 milhão", label: "Acima de R$ 1,5 milhão" },
] as const;
