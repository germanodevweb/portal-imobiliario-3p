/** Escolhe fontSize (px) menor quando o texto é longo. */
export function fitFontSize(
  text: string,
  steps: readonly { maxLen: number; size: number }[],
  fallbackSize: number
): number {
  const len = text.length;
  for (const step of steps) {
    if (len <= step.maxLen) return step.size;
  }
  return fallbackSize;
}

export function truncateEnd(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.6) {
    return slice.slice(0, lastSpace).trimEnd();
  }
  return slice.trimEnd();
}
