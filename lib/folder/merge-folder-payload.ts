import {
  resolveFolderDevelopmentName,
  resolveFolderLocationLine,
} from "@/lib/folder/resolve-folder-display";
import { pickPrimaryPhotoUrl } from "@/lib/folder/pick-primary-photo-url";
import type {
  FolderVerticalEditablePayload,
  PropertyFolderRenderPayload,
} from "@/lib/folder/types";

export type FolderCadastroSnapshot = {
  title: string;
  developmentName: string | null;
  neighborhood: string | null;
  city: string;
  featuredImage: string | null;
  images: {
    url: string;
    isPrimary: boolean;
    isHidden: boolean;
    sortOrder: number;
  }[];
};

/** Tela (validado) → cadastro → derivado do título. */
function resolveMergedDevelopmentName(
  editable: FolderVerticalEditablePayload,
  cadastro: FolderCadastroSnapshot
): string {
  const fromScreen = editable.developmentName.trim();
  if (fromScreen) return fromScreen;
  return resolveFolderDevelopmentName(cadastro.developmentName, cadastro.title);
}

export function mergeFolderPayloadWithCadastro(
  cadastro: FolderCadastroSnapshot,
  editable: FolderVerticalEditablePayload
): PropertyFolderRenderPayload | { error: string } {
  const primaryPhotoUrl = pickPrimaryPhotoUrl(
    cadastro.images,
    cadastro.featuredImage
  );
  if (!primaryPhotoUrl) {
    return { error: "Imóvel sem foto principal para gerar o folder." };
  }

  const { developmentName: _editableDevName, ...editableRest } = editable;

  return {
    ...editableRest,
    developmentName: resolveMergedDevelopmentName(editable, cadastro),
    locationLine: resolveFolderLocationLine(
      cadastro.neighborhood,
      cadastro.city
    ),
    primaryPhotoUrl,
  };
}
