const YTIMG = "https://i.ytimg.com/vi";

export function buildYouTubeMaxResThumbnailUrl(videoId: string): string {
  return `${YTIMG}/${videoId}/maxresdefault.jpg`;
}

export function buildYouTubeHqThumbnailUrl(videoId: string): string {
  return `${YTIMG}/${videoId}/hqdefault.jpg`;
}

/**
 * Prefere maxresdefault quando a imagem existe (HEAD); senão hqdefault.
 */
export async function resolveYouTubeThumbnailUrl(videoId: string): Promise<string> {
  const maxRes = buildYouTubeMaxResThumbnailUrl(videoId);
  try {
    const res = await fetch(maxRes, {
      method: "HEAD",
      next: { revalidate: 86400 },
    });
    const type = res.headers.get("content-type") ?? "";
    if (res.ok && type.includes("image")) {
      return maxRes;
    }
  } catch {
    /* fallback */
  }
  return buildYouTubeHqThumbnailUrl(videoId);
}
