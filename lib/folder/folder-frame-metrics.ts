import type { FolderVariant } from "@/lib/folder/types";

export type FolderLayoutMetrics = {
  width: number;
  height: number;
  whiteVeilHeight: number;
  greenVeilTop: number;
  greenVeilHeight: number;
  logoW: number;
  logoH: number;
  logoLeft: number;
  logoTop: number;
  headerZoneTop: number;
  headerZoneHeight: number;
  photoTop: number;
  photoHeight: number;
  factsTop: number;
  factIconSize: number;
  factIconBox: number;
  factBigFont: number;
  factSmallFont: number;
  factDividerH: number;
  factColWidth: number;
  contactTop: number;
  contactLabelSize: number;
  whatsIconSize: number;
  whatsDddSize: number;
  whatsNumberSize: number;
  logoWhiteW: number;
  logoWhiteH: number;
  logoWhiteLeft: number;
  logoWhiteTop: number;
};

export const FOLDER_LAYOUT_METRICS: Record<FolderVariant, FolderLayoutMetrics> = {
  vertical: {
    width: 1080,
    height: 1920,
    whiteVeilHeight: 600,
    greenVeilTop: 1300,
    greenVeilHeight: 620,
    logoW: 222,
    logoH: 211,
    logoLeft: 429,
    logoTop: 118,
    headerZoneTop: 330,
    headerZoneHeight: 260,
    photoTop: 600,
    photoHeight: 700,
    factsTop: 1335,
    factIconSize: 62,
    factIconBox: 66,
    factBigFont: 64,
    factSmallFont: 22,
    factDividerH: 130,
    factColWidth: 320,
    contactTop: 1540,
    contactLabelSize: 40,
    whatsIconSize: 78,
    whatsDddSize: 40,
    whatsNumberSize: 104,
    logoWhiteW: 110,
    logoWhiteH: 104,
    logoWhiteLeft: 485,
    logoWhiteTop: 1745,
  },
  feed: {
    width: 1080,
    height: 1350,
    whiteVeilHeight: 400,
    greenVeilTop: 900,
    greenVeilHeight: 450,
    logoW: 150,
    logoH: 143,
    logoLeft: 465,
    logoTop: 26,
    headerZoneTop: 170,
    headerZoneHeight: 222,
    photoTop: 400,
    photoHeight: 500,
    factsTop: 920,
    factIconSize: 50,
    factIconBox: 54,
    factBigFont: 54,
    factSmallFont: 22,
    factDividerH: 110,
    factColWidth: 320,
    contactTop: 1100,
    contactLabelSize: 32,
    whatsIconSize: 66,
    whatsDddSize: 40,
    whatsNumberSize: 90,
    logoWhiteW: 80,
    logoWhiteH: 76,
    logoWhiteLeft: 500,
    logoWhiteTop: 1262,
  },
};

export type FolderPhotoSlotRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function getFolderPhotoSlotRect(variant: FolderVariant): FolderPhotoSlotRect {
  const m = FOLDER_LAYOUT_METRICS[variant];
  return {
    left: 0,
    top: m.photoTop,
    width: m.width,
    height: m.photoHeight,
  };
}

/** Faixas verticais onde o blur de fundo deve aparecer (fora do slot da foto/vídeo). */
export function getFolderVideoBlurStripHeights(variant: FolderVariant): {
  topHeight: number;
  bottomTop: number;
  bottomHeight: number;
} {
  const m = FOLDER_LAYOUT_METRICS[variant];
  const bottomTop = m.photoTop + m.photoHeight;
  return {
    topHeight: m.photoTop,
    bottomTop,
    bottomHeight: m.height - bottomTop,
  };
}
