import { ImageResponse } from "next/og";
import { buildFolderCloudinaryImageUrl } from "@/lib/folder/cloudinary-folder-image-url";
import { PropertyFolderVerticalLayout } from "@/lib/folder/vertical-layout";
import {
  loadFolderLogoDataUrl,
  loadFolderOgFonts,
} from "@/lib/folder/load-folder-fonts";
import type { PropertyFolderVerticalPayload } from "@/lib/folder/types";

const PHOTO_FRAMES: { w: number; h: number }[] = [
  { w: 520, h: 780 },
  { w: 440, h: 320 },
  { w: 440, h: 320 },
];

export async function generatePropertyFolderVerticalPng(
  payload: PropertyFolderVerticalPayload
): Promise<ArrayBuffer> {
  const fonts = await loadFolderOgFonts();
  const logoSrc = await loadFolderLogoDataUrl();

  const framedPhotoUrls = payload.photoUrls.map((url, i) => {
    const frame = PHOTO_FRAMES[i] ?? PHOTO_FRAMES[0];
    return buildFolderCloudinaryImageUrl(url, frame.w, frame.h);
  }) as [string, string, string];

  const element = PropertyFolderVerticalLayout({
    ...payload,
    logoSrc,
    framedPhotoUrls,
  });

  const response = new ImageResponse(element, {
    width: 1080,
    height: 1920,
    fonts,
  });

  return response.arrayBuffer();
}
