/**
 * Converte texto simples em HTML mínimo para o editor TipTap.
 * Se já for HTML, devolve sem alterar.
 */
export function escapeHtmlBasic(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function plainTextToDescriptionHtml(raw: string): string {
  const t = raw.trim();
  if (!t) return "<p></p>";
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
  const parts = raw.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return "<p></p>";
  return parts
    .map((p) => `<p>${escapeHtmlBasic(p).replace(/\n/g, "<br />")}</p>`)
    .join("");
}
