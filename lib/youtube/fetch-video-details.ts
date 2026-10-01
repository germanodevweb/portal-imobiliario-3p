import "server-only";

export type { YouTubeVideoDetails } from "@/lib/youtube/fetch-video-details-core";
import {
  fetchYouTubeVideoDetailsCore,
  type YouTubeVideoDetails,
} from "@/lib/youtube/fetch-video-details-core";

/**
 * Busca metadados oficiais via YouTube Data API v3 (server-only / App Router).
 */
export async function fetchYouTubeVideoDetails(
  videoId: string
): Promise<YouTubeVideoDetails | null> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) return null;
  return fetchYouTubeVideoDetailsCore(videoId, apiKey);
}
