const TITLE_SIZES = [44, 38, 34, 30, 26, 22] as const;
const MAX_CHARS_PER_LINE = 22;

function splitTwoLines(text: string): [string, string] | [string] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  if (words.length === 1) return [words[0]];

  let line1 = "";
  for (let i = 0; i < words.length; i++) {
    const next = line1 ? `${line1} ${words[i]}` : words[i];
    if (next.length > MAX_CHARS_PER_LINE && line1) break;
    line1 = next;
  }
  const used = line1.split(/\s+/).length;
  const line2 = words.slice(used).join(" ");
  if (!line2) return [line1];
  return [line1, line2];
}

export type TitleTwoLineLayout = {
  fontSize: number;
  lines: string[];
};

/** Ajusta tamanho para caber em no máximo 2 linhas (nome sobre fundo verde). */
export function fitDevelopmentTitleTwoLines(name: string): TitleTwoLineLayout {
  const trimmed = name.trim();
  for (const fontSize of TITLE_SIZES) {
    const lines = splitTwoLines(trimmed);
    if (lines.length === 1) {
      return { fontSize, lines };
    }
    const ok =
      lines[0].length <= MAX_CHARS_PER_LINE + 4 &&
      lines[1].length <= MAX_CHARS_PER_LINE + 6;
    if (ok) {
      return { fontSize, lines };
    }
  }
  const lines = splitTwoLines(trimmed);
  return { fontSize: 22, lines: lines.slice(0, 2) };
}
