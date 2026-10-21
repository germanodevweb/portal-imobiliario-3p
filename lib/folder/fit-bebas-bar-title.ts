const MAX_BAR_INNER_WIDTH = 960;
const MIN_FONT = 48;
const MAX_FONT_VERTICAL = 96;
const MAX_FONT_FEED = 80;
const CHAR_WIDTH_RATIO = 0.52;

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * CHAR_WIDTH_RATIO;
}

function splitTwoLines(text: string): [string, string] | [string] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [text.trim()];

  let line1 = "";
  for (let i = 0; i < words.length; i += 1) {
    const next = line1 ? `${line1} ${words[i]}` : words[i];
    if (next.length > 28 && line1) break;
    line1 = next;
  }
  const used = line1.split(/\s+/).length;
  const line2 = words.slice(used).join(" ");
  if (!line2) return [line1];
  return [line1, line2];
}

export type BebasBarTitleLayout = {
  fontSize: number;
  lines: string[];
};

export function fitBebasBarTitle(
  rawName: string,
  variant: "vertical" | "feed"
): BebasBarTitleLayout {
  const name = rawName.trim().toUpperCase();
  if (!name) {
    return { fontSize: MIN_FONT, lines: [""] };
  }

  const maxFont = variant === "vertical" ? MAX_FONT_VERTICAL : MAX_FONT_FEED;

  for (let fontSize = maxFont; fontSize >= MIN_FONT; fontSize -= 4) {
    const singleWidth = estimateTextWidth(name, fontSize);
    if (singleWidth <= MAX_BAR_INNER_WIDTH) {
      return { fontSize, lines: [name] };
    }
  }

  for (let fontSize = maxFont; fontSize >= MIN_FONT; fontSize -= 4) {
    const lines = splitTwoLines(name);
    if (lines.length === 1) {
      if (estimateTextWidth(lines[0], fontSize) <= MAX_BAR_INNER_WIDTH) {
        return { fontSize, lines };
      }
      continue;
    }
    const w1 = estimateTextWidth(lines[0], fontSize);
    const w2 = estimateTextWidth(lines[1], fontSize);
    if (w1 <= MAX_BAR_INNER_WIDTH && w2 <= MAX_BAR_INNER_WIDTH) {
      return { fontSize, lines: lines.slice(0, 2) };
    }
  }

  const lines = splitTwoLines(name);
  return { fontSize: MIN_FONT, lines: lines.slice(0, 2) };
}
