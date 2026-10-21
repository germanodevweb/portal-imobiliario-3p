export const FOLDER_DEVELOPMENT_NAME_MAX = 80;

export function parseFolderDevelopmentNameInput(
  v: unknown
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof v !== "string") {
    return { ok: false, error: "Nome do empreendimento inválido." };
  }
  const trimmed = v.trim();
  if (!trimmed) {
    return { ok: false, error: "Nome do empreendimento é obrigatório." };
  }
  return { ok: true, value: trimmed.slice(0, FOLDER_DEVELOPMENT_NAME_MAX) };
}

/** Valor salvo no banco (null = vazio). */
export function normalizeSavedDevelopmentName(
  dbValue: string | null | undefined
): string {
  return dbValue?.trim() ?? "";
}
