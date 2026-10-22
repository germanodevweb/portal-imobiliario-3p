import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import {
  FFMPEG_CORE_LOAD_ERROR,
  ffmpegCoreCdnBaseUrl,
} from "@/lib/folder/ffmpeg-core-cdn";
import { buildFolderVideoFfmpegArgs } from "@/lib/folder/folder-video-filter-graph";
import type { FolderVideoCropMode } from "@/lib/folder/folder-video-filter-graph";
import type { FolderVariant } from "@/lib/folder/types";

export type FolderVideoEncodeProgress = {
  ratio: number;
  message: string;
};

export type FolderVideoEncodeOptions = {
  variant: FolderVariant;
  cropMode: FolderVideoCropMode;
  videoFile: File;
  framePngBlob: Blob;
  onProgress?: (progress: FolderVideoEncodeProgress) => void;
  signal?: AbortSignal;
};

let ffmpegSingleton: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

async function createLoadedFfmpeg(): Promise<FFmpeg> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = new FFmpeg();
  const baseURL = ffmpegCoreCdnBaseUrl();

  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
  } catch {
    throw new Error(FFMPEG_CORE_LOAD_ERROR);
  }

  return ffmpeg;
}

export async function getFolderVideoFfmpeg(): Promise<FFmpeg> {
  if (ffmpegSingleton) {
    return ffmpegSingleton;
  }
  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = createLoadedFfmpeg().then((instance) => {
      ffmpegSingleton = instance;
      return instance;
    });
  }
  return ffmpegLoadPromise;
}

export function terminateFolderVideoFfmpeg(): void {
  if (ffmpegSingleton) {
    void ffmpegSingleton.terminate();
    ffmpegSingleton = null;
  }
  ffmpegLoadPromise = null;
}

const INPUT_VIDEO = "folder-input-video";
const INPUT_FRAME = "folder-frame.png";
const OUTPUT_VIDEO = "folder-output.mp4";

export async function encodeFolderVideoInBrowser(
  options: FolderVideoEncodeOptions
): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("A codificação de vídeo só está disponível no navegador.");
  }
  if (typeof WebAssembly === "undefined") {
    throw new Error(
      "Seu navegador não suporta WebAssembly. Use Chrome ou Edge no computador."
    );
  }

  const ffmpeg = await getFolderVideoFfmpeg();

  if (options.signal?.aborted) {
    throw new DOMException("Cancelado.", "AbortError");
  }

  const progressHandler = ({ progress }: { progress: number }) => {
    options.onProgress?.({
      ratio: Math.min(1, Math.max(0, progress)),
      message: "Codificando vídeo…",
    });
  };
  ffmpeg.on("progress", progressHandler);

  const abortListener = () => {
    terminateFolderVideoFfmpeg();
  };
  options.signal?.addEventListener("abort", abortListener, { once: true });

  try {
    options.onProgress?.({ ratio: 0, message: "Preparando arquivos…" });

    await ffmpeg.writeFile(INPUT_VIDEO, await fetchFile(options.videoFile));
    await ffmpeg.writeFile(INPUT_FRAME, await fetchFile(options.framePngBlob));

    const args = buildFolderVideoFfmpegArgs({
      variant: options.variant,
      cropMode: options.cropMode,
      inputVideoName: INPUT_VIDEO,
      framePngName: INPUT_FRAME,
      outputName: OUTPUT_VIDEO,
    });

    options.onProgress?.({ ratio: 0.02, message: "Iniciando codificação…" });
    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(OUTPUT_VIDEO);
    if (!(data instanceof Uint8Array) || data.byteLength === 0) {
      throw new Error("Não foi possível gerar o MP4.");
    }

    options.onProgress?.({ ratio: 1, message: "Concluído." });
    const mp4Bytes = new Uint8Array(data.byteLength);
    mp4Bytes.set(data);
    return new Blob([mp4Bytes], { type: "video/mp4" });
  } finally {
    ffmpeg.off("progress", progressHandler);
    options.signal?.removeEventListener("abort", abortListener);
    try {
      await ffmpeg.deleteFile(INPUT_VIDEO);
      await ffmpeg.deleteFile(INPUT_FRAME);
      await ffmpeg.deleteFile(OUTPUT_VIDEO);
    } catch {
      /* memfs cleanup best-effort */
    }
  }
}
