/** Versão fixada do @ffmpeg/core (compatível com @ffmpeg/ffmpeg 0.12.x). */
export const FFMPEG_CORE_CDN_VERSION = "0.12.6";

export function ffmpegCoreCdnBaseUrl(): string {
  return `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_CDN_VERSION}/dist/umd`;
}

export const FFMPEG_CORE_LOAD_ERROR =
  "Não foi possível carregar a ferramenta de vídeo. Verifique a internet e tente novamente.";
