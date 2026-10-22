import { ImageResponse } from "next/og";
import { ApprovedFolderLayout } from "@/lib/folder/approved-layout";
import { buildFolderBlurredBackgroundUrl } from "@/lib/folder/cloudinary-folder-image-url";
import {
  FOLDER_LAYOUT_METRICS,
  getFolderPhotoSlotRect,
} from "@/lib/folder/folder-frame-metrics";
import { validateFolderPhoneInput } from "@/lib/folder/folder-phone";
import {
  loadFolderLogoDataUrl,
  loadFolderLogoWhiteDataUrl,
  loadFolderOgFonts,
} from "@/lib/folder/load-folder-fonts";
import {
  punchTransparentPhotoSlot,
  validateFolderVideoFrameAlpha,
} from "@/lib/folder/punch-folder-video-slot";
import type { FolderVariant, PropertyFolderRenderPayload } from "@/lib/folder/types";

async function renderFolderFrameBuffer(
  payload: PropertyFolderRenderPayload,
  variant: FolderVariant
): Promise<Buffer> {
  const phoneParsed = validateFolderPhoneInput(payload.phone);
  if (!phoneParsed.ok) {
    throw new Error(phoneParsed.error);
  }

  const m = FOLDER_LAYOUT_METRICS[variant];

  const blurredBgUrl = buildFolderBlurredBackgroundUrl(
    payload.primaryPhotoUrl,
    m.width,
    m.height
  );

  const [fonts, logoSrc, logoWhiteSrc] = await Promise.all([
    loadFolderOgFonts(),
    loadFolderLogoDataUrl(),
    loadFolderLogoWhiteDataUrl(),
  ]);

  const element = ApprovedFolderLayout({
    variant,
    logoSrc,
    logoWhiteSrc,
    blurredBgUrl,
    mainPhotoUrl: "",
    photoSlot: "transparent",
    developmentName: payload.developmentName,
    locationLine: payload.locationLine,
    sealBannerText: payload.sealBannerText,
    highlightBedrooms: payload.highlightBedrooms,
    showLeisure: payload.showLeisure,
    highlightGarage: payload.highlightGarage,
    phone: phoneParsed.display,
  });

  const response = new ImageResponse(element, {
    width: m.width,
    height: m.height,
    fonts,
  });

  const raw = Buffer.from(await response.arrayBuffer());
  const slot = getFolderPhotoSlotRect(variant);
  const punched = await punchTransparentPhotoSlot(raw, slot);

  const greenSampleY = m.greenVeilTop + 2;
  await validateFolderVideoFrameAlpha(punched, slot, greenSampleY);

  return punched;
}

export async function generatePropertyFolderVideoFrame(
  payload: PropertyFolderRenderPayload,
  variant: FolderVariant
): Promise<ArrayBuffer> {
  const png = await renderFolderFrameBuffer(payload, variant);
  return Uint8Array.from(png).buffer;
}
