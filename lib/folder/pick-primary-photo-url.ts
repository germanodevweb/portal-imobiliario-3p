export type PropertyImageRow = {
  url: string;
  isPrimary: boolean;
  isHidden: boolean;
  sortOrder: number;
};

/** Foto principal: isPrimary visível; senão featuredImage. */
export function pickPrimaryPhotoUrl(
  images: PropertyImageRow[],
  featuredImage: string | null
): string | null {
  const visible = images
    .filter((i) => i.url.trim() && !i.isHidden)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const primary = visible.find((i) => i.isPrimary) ?? visible[0];
  if (primary?.url.trim()) return primary.url.trim();

  const featured = featuredImage?.trim();
  return featured || null;
}
