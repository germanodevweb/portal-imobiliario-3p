import type { FolderVariant } from "@/lib/folder/types";

const MAX_BAR_INNER_WIDTH = 960;
const MIN_FONT_TWO_LINES = 48;
const CHAR_WIDTH_RATIO = 0.52;

const MAX_TITLE_FONT: Record<FolderVariant, number> = {
  vertical: 96,
  feed: 80,
};

/** Menor fonte ainda em 1 linha antes de quebrar em 2. */
const MIN_SINGLE_LINE_FONT: Record<FolderVariant, number> = {
  vertical: 64,
  feed: 54,
};

const HEADER_ZONE_HEIGHT: Record<FolderVariant, number> = {
  vertical: 260,
  feed: 222,
};

const DEFAULT_SEAL: Record<FolderVariant, { fontSize: number; letterSpacing: number }> =
  {
    vertical: { fontSize: 26, letterSpacing: 9 },
    feed: { fontSize: 22, letterSpacing: 9 },
  };

const DEFAULT_LOCAL: Record<FolderVariant, { fontSize: number; letterSpacing: number }> =
  {
    vertical: { fontSize: 28, letterSpacing: 7 },
    feed: { fontSize: 24, letterSpacing: 7 },
  };

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * CHAR_WIDTH_RATIO;
}

function splitTwoLines(text: string): [string, string] | [string] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [text.trim()];

  let line1 = "";
  for (let i = 0; i < words.length; i += 1) {
    const next = line1 ? `${line1} ${words[i]}` : words[i];
    if (next.length > 32 && line1) break;
    line1 = next;
  }
  const used = line1.split(/\s+/).length;
  const line2 = words.slice(used).join(" ");
  if (!line2) return [line1];
  return [line1, line2];
}

function titleFitsWidth(lines: string[], fontSize: number): boolean {
  return lines.every((line) => estimateTextWidth(line, fontSize) <= MAX_BAR_INNER_WIDTH);
}

function estimateBarHeight(lineCount: number, fontSize: number): number {
  const lines = Math.max(1, lineCount);
  return 10 + 4 + lines * fontSize + (lines > 1 ? (lines - 1) * 2 : 0);
}

export type BebasBarTitleLayout = {
  fontSize: number;
  lines: string[];
};

export type FolderHeaderBlockLayout = {
  title: BebasBarTitleLayout;
  stackGap: number;
  sealFontSize: number;
  sealLetterSpacing: number;
  localFontSize: number;
  localLetterSpacing: number;
};

function pickTitleLayout(
  name: string,
  variant: FolderVariant
): BebasBarTitleLayout {
  const maxFont = MAX_TITLE_FONT[variant];
  const minSingle = MIN_SINGLE_LINE_FONT[variant];

  for (let fontSize = maxFont; fontSize >= minSingle; fontSize -= 4) {
    if (titleFitsWidth([name], fontSize)) {
      return { fontSize, lines: [name] };
    }
  }

  for (let fontSize = maxFont; fontSize >= MIN_FONT_TWO_LINES; fontSize -= 4) {
    const lines = splitTwoLines(name);
    if (titleFitsWidth(lines, fontSize)) {
      return { fontSize, lines: lines.slice(0, 2) };
    }
  }

  const lines = splitTwoLines(name);
  return { fontSize: MIN_FONT_TWO_LINES, lines: lines.slice(0, 2) };
}

function estimateStackHeight(
  hasSeal: boolean,
  hasLocal: boolean,
  title: BebasBarTitleLayout,
  sealFontSize: number,
  localFontSize: number,
  stackGap: number
): number {
  let h = 0;
  const parts: number[] = [];

  if (hasSeal) parts.push(sealFontSize * 1.15);
  parts.push(estimateBarHeight(title.lines.length, title.fontSize));
  if (hasLocal) parts.push(localFontSize * 1.15);

  h = parts.reduce((a, b) => a + b, 0);
  if (parts.length > 1) {
    h += stackGap * (parts.length - 1);
  }
  return h;
}

/**
 * Selo + barra do nome + local em coluna, cabendo na faixa entre logo e foto.
 */
export function fitFolderHeaderBlock(input: {
  developmentName: string;
  sealBannerText: string;
  locationLine: string;
  variant: FolderVariant;
}): FolderHeaderBlockLayout {
  const name = input.developmentName.trim().toUpperCase();
  const hasSeal = input.sealBannerText.trim().length > 0;
  const hasLocal = input.locationLine.trim().length > 0;
  const zoneHeight = HEADER_ZONE_HEIGHT[input.variant];

  let stackGap = input.variant === "vertical" ? 10 : 8;
  let sealFontSize = DEFAULT_SEAL[input.variant].fontSize;
  let sealLetterSpacing = DEFAULT_SEAL[input.variant].letterSpacing;
  let localFontSize = DEFAULT_LOCAL[input.variant].fontSize;
  let localLetterSpacing = DEFAULT_LOCAL[input.variant].letterSpacing;

  let title = name
    ? pickTitleLayout(name, input.variant)
    : { fontSize: MIN_SINGLE_LINE_FONT[input.variant], lines: [""] };

  const shrink = (): boolean => {
    if (stackGap > 2) {
      stackGap -= 2;
      return true;
    }
    if (title.fontSize > MIN_FONT_TWO_LINES) {
      title = { ...title, fontSize: title.fontSize - 4 };
      return true;
    }
    if (title.lines.length === 1 && name) {
      const two = splitTwoLines(name);
      if (two.length > 1) {
        title = {
          fontSize: Math.max(MIN_FONT_TWO_LINES, title.fontSize - 4),
          lines: two.slice(0, 2),
        };
        return true;
      }
    }
    if (hasSeal && sealFontSize > 18) {
      sealFontSize -= 2;
      sealLetterSpacing = Math.max(4, sealLetterSpacing - 1);
      return true;
    }
    if (hasLocal && localFontSize > 18) {
      localFontSize -= 2;
      localLetterSpacing = Math.max(3, localLetterSpacing - 1);
      return true;
    }
    return false;
  };

  let guard = 0;
  while (
    estimateStackHeight(hasSeal, hasLocal, title, sealFontSize, localFontSize, stackGap) >
      zoneHeight &&
    guard < 80
  ) {
    if (!shrink()) break;
    guard += 1;
  }

  if (name && !titleFitsWidth(title.lines, title.fontSize)) {
    title = pickTitleLayout(name, input.variant);
  }

  return {
    title,
    stackGap,
    sealFontSize,
    sealLetterSpacing,
    localFontSize,
    localLetterSpacing,
  };
}

/** @deprecated use fitFolderHeaderBlock */
export function fitBebasBarTitle(
  rawName: string,
  variant: FolderVariant
): BebasBarTitleLayout {
  return fitFolderHeaderBlock({
    developmentName: rawName,
    sealBannerText: "",
    locationLine: "",
    variant,
  }).title;
}
