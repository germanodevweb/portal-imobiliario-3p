export const FOLDER_NEARBY_ICON_IDS = [
  "shopping",
  "supermarket",
  "gym",
  "pharmacy",
  "restaurant",
  "transport",
  "school",
  "hospital",
  "beach",
  "park",
  "university",
  "bank",
] as const;

export type FolderNearbyIconId = (typeof FOLDER_NEARBY_ICON_IDS)[number];

export const FOLDER_HIGHLIGHT_ICON_IDS = [
  "balcony",
  "leisure",
  "security",
  "parking",
  "elevator",
  "sea_view",
  "suite",
  "furnished",
  "pet",
] as const;

export type FolderHighlightIconId = (typeof FOLDER_HIGHLIGHT_ICON_IDS)[number];

export const FOLDER_SEAL_PRESETS = [
  "pronto",
  "lancamento",
  "oportunidade",
  "planta",
] as const;

export type FolderSealPreset = (typeof FOLDER_SEAL_PRESETS)[number];

export type FolderNearbyPoint = {
  iconId: FolderNearbyIconId;
  label: string;
};

export type FolderHighlight = {
  iconId: FolderHighlightIconId;
  text: string;
};

export type PropertyFolderVerticalPayload = {
  developmentName: string;
  subtitle: string;
  neighborhood: string;
  locationText: string;
  bedrooms: number;
  nearbyPoints: FolderNearbyPoint[];
  highlights: FolderHighlight[];
  seal: FolderSealPreset;
  footerPhrase: string;
  showWhatsApp: boolean;
  photoUrls: [string, string, string];
};

export type FolderGalleryImage = {
  url: string;
  environmentLabel: string;
  isHidden: boolean;
  sortOrder: number;
  isPrimary: boolean;
};

export type FolderPropertyDefaults = {
  propertyId: string;
  slug: string;
  description: string;
  developmentName: string;
  subtitle: string;
  neighborhood: string;
  bedrooms: number;
  locationText: string;
  seal: FolderSealPreset;
  footerPhrase: string;
  showWhatsApp: boolean;
  photoUrls: [string, string, string];
  gallery: FolderGalleryImage[];
};
