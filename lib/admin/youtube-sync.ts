import "server-only";

import { fetchYouTubeVideoDetails } from "@/lib/youtube/fetch-video-details";

export type PropertyYouTubePersistFields = {
  youtubeTitle: string | null;
  youtubeDescription: string | null;
  youtubePublishedAt: Date | null;
  youtubeDurationIso: string | null;
};

export const YOUTUBE_SYNC_WARNING_MESSAGE =
  "Imóvel salvo, mas não foi possível sincronizar metadados do YouTube (verifique YOUTUBE_API_KEY ou o ID do vídeo).";

/**
 * Metadados para gravar junto ao imóvel ao salvar no admin.
 */
export async function resolvePropertyYouTubePersistFields(
  youtubeVideoId: string | null,
  previousVideoId: string | null,
  previousFields: PropertyYouTubePersistFields
): Promise<{ fields: PropertyYouTubePersistFields; warning?: string }> {
  const empty: PropertyYouTubePersistFields = {
    youtubeTitle: null,
    youtubeDescription: null,
    youtubePublishedAt: null,
    youtubeDurationIso: null,
  };

  if (!youtubeVideoId) {
    return { fields: empty };
  }

  const idUnchanged =
    previousVideoId === youtubeVideoId &&
    previousFields.youtubeTitle &&
    previousFields.youtubePublishedAt &&
    previousFields.youtubeDurationIso;

  if (idUnchanged) {
    return { fields: previousFields };
  }

  const details = await fetchYouTubeVideoDetails(youtubeVideoId);
  if (!details) {
    if (previousVideoId === youtubeVideoId) {
      return { fields: previousFields, warning: YOUTUBE_SYNC_WARNING_MESSAGE };
    }
    return { fields: empty, warning: YOUTUBE_SYNC_WARNING_MESSAGE };
  }

  return {
    fields: {
      youtubeTitle: details.title,
      youtubeDescription: details.description || null,
      youtubePublishedAt: details.publishedAt,
      youtubeDurationIso: details.durationIso,
    },
  };
}
