"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { savePropertyDevelopmentNameFromFolderAction } from "@/lib/admin/actions";
import { FOLDER_DEVELOPMENT_NAME_MAX } from "@/lib/folder/development-name-input";
import type { FolderPropertyDefaults } from "@/lib/folder/types";

type AdminPropertyFolderFormProps = {
  defaults: FolderPropertyDefaults;
};

type FolderVariant = "vertical" | "feed";

const fieldClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600";
const labelClass = "block text-sm font-medium text-zinc-200";

const FolderVideoSection = dynamic(
  () =>
    import("@/app/components/admin/FolderVideoSection").then(
      (m) => m.FolderVideoSection
    ),
  { ssr: false }
);

export function AdminPropertyFolderForm({ defaults }: AdminPropertyFolderFormProps) {
  const [developmentName, setDevelopmentName] = useState(
    defaults.developmentNameDisplay
  );
  const [savedDevelopmentName, setSavedDevelopmentName] = useState(
    defaults.savedDevelopmentName
  );
  const [saveNotice, setSaveNotice] = useState(false);
  const [sealBannerText, setSealBannerText] = useState(defaults.sealBannerText);
  const [showFullPhoto, setShowFullPhoto] = useState(defaults.showFullPhoto);
  const [highlightBedrooms, setHighlightBedrooms] = useState(defaults.highlightBedrooms);
  const [showLeisure, setShowLeisure] = useState(defaults.showLeisure);
  const [highlightGarage, setHighlightGarage] = useState(defaults.highlightGarage);
  const [phone, setPhone] = useState(defaults.phone);
  const [previewVertical, setPreviewVertical] = useState<string | null>(null);
  const [previewFeed, setPreviewFeed] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      developmentName: developmentName.trim().slice(0, FOLDER_DEVELOPMENT_NAME_MAX),
      sealBannerText,
      showFullPhoto,
      highlightBedrooms,
      showLeisure,
      highlightGarage,
      phone,
    }),
    [
      developmentName,
      sealBannerText,
      showFullPhoto,
      highlightBedrooms,
      showLeisure,
      highlightGarage,
      phone,
    ]
  );

  const fetchPreview = useCallback(
    async (variant: FolderVariant): Promise<{ ok: true; blob: Blob } | { ok: false; error: string }> => {
      const res = await fetch(
        `/api/admin/folder/${defaults.propertyId}?variant=${variant}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        return {
          ok: false,
          error: data?.error ?? "Não foi possível gerar a pré-visualização.",
        };
      }
      const blob = await res.blob();
      return { ok: true, blob };
    },
    [defaults.propertyId, payload]
  );

  const refreshPreview = useCallback(async () => {
    if (!defaults.primaryPhotoUrl) {
      setPreviewError("Cadastre uma foto principal no imóvel.");
      return;
    }
    setLoadingPreview(true);
    setPreviewError(null);
    try {
      const [vertical, feed] = await Promise.all([
        fetchPreview("vertical"),
        fetchPreview("feed"),
      ]);
      const failed = !vertical.ok ? vertical : !feed.ok ? feed : null;
      if (failed && !failed.ok) {
        setPreviewError(failed.error);
        return;
      }
      if (vertical.ok) {
        const url = URL.createObjectURL(vertical.blob);
        setPreviewVertical((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      }
      if (feed.ok) {
        const url = URL.createObjectURL(feed.blob);
        setPreviewFeed((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      }
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Erro na pré-visualização.");
    } finally {
      setLoadingPreview(false);
    }
  }, [defaults.primaryPhotoUrl, fetchPreview]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refreshPreview();
    }, 700);
    return () => window.clearTimeout(t);
  }, [refreshPreview]);

  useEffect(() => {
    return () => {
      if (previewVertical) URL.revokeObjectURL(previewVertical);
      if (previewFeed) URL.revokeObjectURL(previewFeed);
    };
  }, [previewVertical, previewFeed]);

  async function persistDevelopmentNameIfNeeded(): Promise<boolean> {
    const trimmed = developmentName.trim().slice(0, FOLDER_DEVELOPMENT_NAME_MAX);
    if (!trimmed) {
      setPreviewError("Informe o nome do empreendimento.");
      return false;
    }
    if (trimmed === savedDevelopmentName.trim()) {
      return true;
    }
    const result = await savePropertyDevelopmentNameFromFolderAction(
      defaults.propertyId,
      trimmed
    );
    if (!result.ok) {
      setPreviewError(result.error);
      return false;
    }
    setSavedDevelopmentName(trimmed);
    setSaveNotice(true);
    window.setTimeout(() => setSaveNotice(false), 4000);
    return true;
  }

  async function handleDownload(variant: FolderVariant, format: "png" | "jpeg") {
    const key = `${variant}-${format}`;
    setDownloading(key);
    try {
      if (!(await persistDevelopmentNameIfNeeded())) {
        return;
      }
      const qs = new URLSearchParams({ variant });
      if (format === "jpeg") qs.set("format", "jpeg");
      const res = await fetch(
        `/api/admin/folder/${defaults.propertyId}?${qs.toString()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Erro ao baixar arquivo.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const suffix = variant === "feed" ? "feed" : "vertical";
      a.download =
        format === "jpeg"
          ? `${defaults.slug}-${suffix}.jpg`
          : `${defaults.slug}-${suffix}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Erro no download.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
      <div className="space-y-8 rounded-xl border border-zinc-700 bg-zinc-900/60 p-6">
        <section>
          <h2 className="text-lg font-semibold text-white">Identidade</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className={labelClass} htmlFor="developmentName">
                Nome do empreendimento
              </label>
              <input
                id="developmentName"
                className={fieldClass}
                value={developmentName}
                onChange={(e) =>
                  setDevelopmentName(e.target.value.slice(0, FOLDER_DEVELOPMENT_NAME_MAX))
                }
                maxLength={FOLDER_DEVELOPMENT_NAME_MAX}
              />
              <p className="mt-1 text-xs text-zinc-500">
                Usado no folder. Ao baixar, salva no cadastro se mudou.
              </p>
              {saveNotice ? (
                <p className="mt-1 text-xs text-green-400">Nome salvo no cadastro</p>
              ) : null}
            </div>
            <div>
              <span className={labelClass}>Local no topo (cadastro)</span>
              <p className="mt-1 rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-100">
                {defaults.locationLine || "—"}
              </p>
              <Link
                href={defaults.propertyEditHref}
                className="mt-2 inline-block text-sm font-medium text-green-400 hover:text-green-300"
              >
                Editar bairro e cidade no cadastro →
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="sealBannerText">
              Selo (acima da barra verde)
            </label>
            <input
              id="sealBannerText"
              className={fieldClass}
              value={sealBannerText}
              onChange={(e) => setSealBannerText(e.target.value.slice(0, 30))}
              maxLength={30}
              placeholder="Vazio oculta o selo"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-200 sm:col-span-2">
            <input
              type="checkbox"
              checked={showFullPhoto}
              onChange={(e) => setShowFullPhoto(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-500"
            />
            Mostrar foto inteira (sem recorte)
          </label>
          <div>
            <label className={labelClass} htmlFor="highlightBedrooms">
              Quartos
            </label>
            <input
              id="highlightBedrooms"
              type="number"
              min={0}
              max={99}
              className={fieldClass}
              value={highlightBedrooms}
              onChange={(e) => setHighlightBedrooms(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-zinc-500">0 oculta no folder</p>
          </div>
          <div>
            <span className={labelClass}>Lazer de clube</span>
            <div className="mt-2 flex gap-4 text-sm text-zinc-200">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="showLeisure"
                  checked={showLeisure}
                  onChange={() => setShowLeisure(true)}
                />
                Sim
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="showLeisure"
                  checked={!showLeisure}
                  onChange={() => setShowLeisure(false)}
                />
                Não
              </label>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="highlightGarage">
              Vagas
            </label>
            <input
              id="highlightGarage"
              type="number"
              min={0}
              max={99}
              className={fieldClass}
              value={highlightGarage}
              onChange={(e) => setHighlightGarage(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-zinc-500">0 oculta no folder</p>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="phone">
              Telefone / WhatsApp
            </label>
            <input
              id="phone"
              className={fieldClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={defaults.phoneRequired}
              placeholder="(85) 98937-9295"
            />
            {defaults.phoneRequired ? (
              <p className="mt-1 text-xs text-zinc-500">
                Defina NEXT_PUBLIC_WHATSAPP_PHONE no ambiente ou informe o número aqui.
              </p>
            ) : null}
          </div>
        </section>

        <FolderVideoSection
          propertyId={defaults.propertyId}
          slug={defaults.slug}
          youtubeVideoId={defaults.youtubeVideoId}
          primaryPhotoUrl={defaults.primaryPhotoUrl}
          payload={payload}
          onBeforeGenerate={persistDevelopmentNameIfNeeded}
        />
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4">
          <h2 className="text-sm font-semibold text-white">Pré-visualização</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-zinc-400">Vertical</p>
              <div className="relative mt-1 aspect-[9/16] overflow-hidden rounded-lg bg-zinc-800">
                {previewVertical ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewVertical}
                    alt="Pré-visualização vertical"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                    {loadingPreview ? "Gerando…" : "—"}
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Feed</p>
              <div className="relative mt-1 aspect-[4/5] overflow-hidden rounded-lg bg-zinc-800">
                {previewFeed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewFeed}
                    alt="Pré-visualização feed"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                    {loadingPreview ? "Gerando…" : "—"}
                  </div>
                )}
              </div>
            </div>
          </div>
          {previewError ? (
            <p className="mt-2 text-xs text-amber-400">{previewError}</p>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!!downloading || !defaults.primaryPhotoUrl}
              onClick={() => void handleDownload("vertical", "png")}
              className="rounded-lg bg-green-700 px-2 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
            >
              {downloading === "vertical-png" ? "…" : "Baixar Vertical PNG"}
            </button>
            <button
              type="button"
              disabled={!!downloading || !defaults.primaryPhotoUrl}
              onClick={() => void handleDownload("vertical", "jpeg")}
              className="rounded-lg bg-green-700 px-2 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
            >
              {downloading === "vertical-jpeg" ? "…" : "Baixar Vertical JPG"}
            </button>
            <button
              type="button"
              disabled={!!downloading || !defaults.primaryPhotoUrl}
              onClick={() => void handleDownload("feed", "png")}
              className="rounded-lg bg-green-800 px-2 py-2 text-xs font-semibold text-white hover:bg-green-900 disabled:opacity-50"
            >
              {downloading === "feed-png" ? "…" : "Baixar Feed PNG"}
            </button>
            <button
              type="button"
              disabled={!!downloading || !defaults.primaryPhotoUrl}
              onClick={() => void handleDownload("feed", "jpeg")}
              className="rounded-lg bg-green-800 px-2 py-2 text-xs font-semibold text-white hover:bg-green-900 disabled:opacity-50"
            >
              {downloading === "feed-jpeg" ? "…" : "Baixar Feed JPG"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
