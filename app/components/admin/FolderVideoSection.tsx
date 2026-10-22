"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  encodeFolderVideoInBrowser,
  terminateFolderVideoFfmpeg,
} from "@/lib/folder/folder-video-encode";
import type { FolderVideoCropMode } from "@/lib/folder/folder-video-filter-graph";
import type { FolderVerticalEditablePayload } from "@/lib/folder/types";

type FolderVariant = "vertical" | "feed";

const MAX_VIDEO_BYTES = 300 * 1024 * 1024;
const WARN_DURATION_SEC = 60;

type VideoMeta = {
  durationSec: number;
  width: number;
  height: number;
  sizeBytes: number;
};

type FolderVideoSectionProps = {
  propertyId: string;
  slug: string;
  youtubeVideoId: string | null;
  primaryPhotoUrl: string | null;
  payload: FolderVerticalEditablePayload;
  onBeforeGenerate: () => Promise<boolean>;
};

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export function FolderVideoSection({
  propertyId,
  slug,
  youtubeVideoId,
  primaryPhotoUrl,
  payload,
  onBeforeGenerate,
}: FolderVideoSectionProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [cropMode, setCropMode] = useState<FolderVideoCropMode>("fill");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ ratio: number; message: string } | null>(
    null
  );
  const [busyVariant, setBusyVariant] = useState<FolderVariant | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const probeUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (probeUrlRef.current) {
        URL.revokeObjectURL(probeUrlRef.current);
      }
      terminateFolderVideoFfmpeg();
    };
  }, []);

  const probeVideo = useCallback((file: File) => {
    if (probeUrlRef.current) {
      URL.revokeObjectURL(probeUrlRef.current);
      probeUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    probeUrlRef.current = url;
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      setMeta({
        durationSec: Number.isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth,
        height: video.videoHeight,
        sizeBytes: file.size,
      });
    };
    video.onerror = () => {
      setMeta(null);
      setError("Não foi possível ler o vídeo selecionado.");
    };
  }, []);

  function handleFileChange(file: File | null) {
    setError(null);
    setVideoFile(null);
    setMeta(null);
    if (!file) return;

    if (file.size > MAX_VIDEO_BYTES) {
      setError(
        `Arquivo acima de 300 MB (${formatMb(file.size)} MB). Escolha um vídeo menor.`
      );
      return;
    }

    setVideoFile(file);
    probeVideo(file);
  }

  async function fetchFramePng(variant: FolderVariant): Promise<Blob> {
    const res = await fetch(
      `/api/admin/folder/${propertyId}?frame=video&variant=${variant}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Não foi possível gerar a moldura do vídeo.");
    }
    return res.blob();
  }

  async function handleGenerate(variant: FolderVariant) {
    if (!videoFile || !primaryPhotoUrl) {
      setError("Selecione um vídeo e confirme que o imóvel tem foto principal.");
      return;
    }
    if (!(await onBeforeGenerate())) {
      return;
    }

    setError(null);
    setBusyVariant(variant);
    setProgress({ ratio: 0, message: "Carregando ferramenta de vídeo…" });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const frameBlob = await fetchFramePng(variant);
      const mp4Blob = await encodeFolderVideoInBrowser({
        variant,
        cropMode,
        videoFile,
        framePngBlob: frameBlob,
        signal: controller.signal,
        onProgress: setProgress,
      });

      const url = URL.createObjectURL(mp4Blob);
      const a = document.createElement("a");
      a.href = url;
      const suffix = variant === "feed" ? "feed" : "vertical";
      a.download = `${slug}-video-${suffix}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("Geração cancelada.");
      } else {
        setError(e instanceof Error ? e.message : "Erro ao gerar vídeo.");
      }
    } finally {
      abortRef.current = null;
      setBusyVariant(null);
      setProgress(null);
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    terminateFolderVideoFfmpeg();
    setBusyVariant(null);
    setProgress(null);
  }

  const studioHref = youtubeVideoId
    ? `https://studio.youtube.com/video/${youtubeVideoId}/edit`
    : null;

  return (
    <section className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-6">
      <h2 className="text-lg font-semibold text-white">Vídeo</h2>
      <p className="mt-1 text-xs text-zinc-400">
        O vídeo é processado só no seu navegador; nada é enviado ao servidor.
      </p>

      {studioHref ? (
        <p className="mt-3 text-sm text-zinc-200">
          Vídeo no cadastro:{" "}
          <a
            href={studioHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-400 hover:text-green-300"
          >
            Abrir no YouTube Studio
          </a>
          <span className="block text-xs text-zinc-500">
            Baixe o MP4 no Studio e use o arquivo local abaixo.
          </span>
        </p>
      ) : null}

      <div className="mt-4">
        <label className="block text-sm font-medium text-zinc-200" htmlFor="folderVideoFile">
          Arquivo de vídeo
        </label>
        <input
          id="folderVideoFile"
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          disabled={!!busyVariant}
          className="mt-1 block w-full text-sm text-zinc-200 file:mr-3 file:rounded-lg file:border-0 file:bg-green-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-green-900"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {meta ? (
        <ul className="mt-3 space-y-1 text-xs text-zinc-400">
          <li>
            Duração: {meta.durationSec.toFixed(1)} s · {meta.width}×{meta.height} ·{" "}
            {formatMb(meta.sizeBytes)} MB
          </li>
          {meta.durationSec > WARN_DURATION_SEC ? (
            <li className="text-amber-400">
              Acima de 60 s: adequado para Status (WhatsApp); Reels/Stories preferem até 60 s.
            </li>
          ) : null}
          {meta.height > meta.width ? (
            <li className="text-amber-400">
              Vídeo vertical: pode aparecer menor no retângulo horizontal do folder.
            </li>
          ) : null}
        </ul>
      ) : null}

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-zinc-200">Encaixe no slot da foto</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-200">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="folderVideoCrop"
              checked={cropMode === "fill"}
              disabled={!!busyVariant}
              onChange={() => setCropMode("fill")}
            />
            Preencher (recortar)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="folderVideoCrop"
              checked={cropMode === "fit"}
              disabled={!!busyVariant}
              onChange={() => setCropMode("fit")}
            />
            Mostrar inteiro
          </label>
        </div>
      </fieldset>

      {progress ? (
        <div className="mt-4">
          <p className="text-xs text-zinc-300">{progress.message}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-green-600 transition-all"
              style={{ width: `${Math.round(progress.ratio * 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-amber-400">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!!busyVariant || !videoFile || !primaryPhotoUrl}
          onClick={() => void handleGenerate("vertical")}
          className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
        >
          {busyVariant === "vertical" ? "Gerando…" : "Gerar vídeo vertical"}
        </button>
        <button
          type="button"
          disabled={!!busyVariant || !videoFile || !primaryPhotoUrl}
          onClick={() => void handleGenerate("feed")}
          className="rounded-lg bg-green-800 px-3 py-2 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-50"
        >
          {busyVariant === "feed" ? "Gerando…" : "Gerar vídeo feed"}
        </button>
        {busyVariant ? (
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-zinc-500 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </section>
  );
}
