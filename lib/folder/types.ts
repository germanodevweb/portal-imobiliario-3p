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

export type FolderVariant = "vertical" | "feed";

export type FolderVerticalEditablePayload = {
  sealBannerText: string;
  showFullPhoto: boolean;
  highlightBedrooms: number;
  showLeisure: boolean;
  highlightGarage: number;
  phone: string;
};

export type PropertyFolderRenderPayload = {
  developmentName: string;
  locationLine: string;
  sealBannerText: string;
  showFullPhoto: boolean;
  highlightBedrooms: number;
  showLeisure: boolean;
  highlightGarage: number;
  phone: string;
  primaryPhotoUrl: string;
};

export type FolderPropertyDefaults = {
  propertyId: string;
  slug: string;
  propertyEditHref: string;
  developmentNameDisplay: string;
  locationLine: string;
  neighborhoodDisplay: string;
  cityDisplay: string;
  primaryPhotoUrl: string | null;
  highlightBedrooms: number;
  highlightGarage: number;
  showLeisure: boolean;
  sealBannerText: string;
  showFullPhoto: boolean;
  phone: string;
  phoneRequired: boolean;
};
