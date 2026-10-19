"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  FOLDER_HIGHLIGHT_ICON_IDS,
  FOLDER_NEARBY_ICON_IDS,
  FOLDER_SEAL_PRESETS,
  type FolderHighlight,
  type FolderHighlightIconId,
  type FolderNearbyIconId,
  type FolderNearbyPoint,
  type FolderPropertyDefaults,
  type FolderSealPreset,
} from "@/lib/folder/types";
import {
  HIGHLIGHT_ICON_LABELS,
  NEARBY_ICON_LABELS,
} from "@/lib/folder/folder-icons";
import { sanitizeNeighborhoodLabel } from "@/lib/folder/sanitize-neighborhood";

type AdminPropertyFolderFormProps = {
  defaults: FolderPropertyDefaults;
  city: string;
};

type PhotoSlot = 0 | 1 | 2;

const SLOT_LABELS = ["Foto 1 (principal)", "Foto 2 (topo)", "Foto 3 (base)"] as const;

const SEAL_LABELS: Record<FolderSealPreset, string> = {
  pronto: "Pronto para Morar!",
  lancamento: "Lançamento!",
  oportunidade: "Oportunidade!",
  destaque: "Imóvel em Destaque!",
  planta: "Na Planta!",
};

function defaultHighlights(): FolderHighlight[] {
  return [
    { iconId: "leisure", text: "Área de lazer completa" },
    { iconId: "parking", text: "Vaga de garagem" },
    { iconId: "security", text: "Segurança e conforto" },
  ];
}

export function AdminPropertyFolderForm({
  defaults,
  city,
}: AdminPropertyFolderFormProps) {
  const [developmentName, setDevelopmentName] = useState(defaults.developmentName);
  const [subtitle, setSubtitle] = useState(defaults.subtitle);
  const [neighborhood, setNeighborhood] = useState(defaults.neighborhood);
  const [locationText, setLocationText] = useState(defaults.locationText);
  const [bedrooms, setBedrooms] = useState(defaults.bedrooms);
  const [nearbyPoints, setNearbyPoints] = useState<FolderNearbyPoint[]>(
    defaults.nearbyPoints ?? []
  );
  const [highlights, setHighlights] = useState<FolderHighlight[]>(defaultHighlights);
  const [seal, setSeal] = useState<FolderSealPreset>(defaults.seal);
  const [footerPhrase, setFooterPhrase] = useState(defaults.footerPhrase);
  const [showWhatsApp, setShowWhatsApp] = useState(defaults.showWhatsApp);
  const [photoUrls, setPhotoUrls] = useState<[string, string, string]>(
    defaults.photoUrls
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [swapSlot, setSwapSlot] = useState<PhotoSlot | null>(null);
  const [downloading, setDownloading] = useState<"png" | "jpeg" | null>(null);

  const payload = useMemo(
    () => ({
      developmentName,
      subtitle,
      neighborhood,
      locationText,
      bedrooms,
      nearbyPoints,
      highlights,
      seal,
      footerPhrase,
      showWhatsApp,
      photoUrls,
    }),
    [
      developmentName,
      subtitle,
      neighborhood,
      locationText,
      bedrooms,
      nearbyPoints,
      highlights,
      seal,
      footerPhrase,
      showWhatsApp,
      photoUrls,
    ]
  );

  const refreshPreview = useCallback(async () => {
    setLoadingPreview(true);
    setPreviewError(null);
    try {
      const res = await fetch(`/api/admin/folder/${defaults.propertyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Não foi possível gerar a pré-visualização.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Erro na pré-visualização.");
    } finally {
      setLoadingPreview(false);
    }
  }, [defaults.propertyId, payload]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refreshPreview();
    }, 700);
    return () => window.clearTimeout(t);
  }, [refreshPreview]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleSuggestLocation() {
    setLoadingAi(true);
    try {
      const res = await fetch(
        `/api/admin/folder/${defaults.propertyId}/suggest-location`,
        { method: "POST" }
      );
      const data = (await res.json()) as { success?: boolean; text?: string; error?: string };
      if (!res.ok || !data.success || !data.text) {
        throw new Error(data.error ?? "Falha ao sugerir texto.");
      }
      setLocationText(data.text.slice(0, 320));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Erro ao sugerir com IA.");
    } finally {
      setLoadingAi(false);
    }
  }

  async function handleDownload(format: "png" | "jpeg") {
    setDownloading(format);
    try {
      const qs = format === "jpeg" ? "?format=jpeg" : "";
      const res = await fetch(
        `/api/admin/folder/${defaults.propertyId}${qs}`,
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
      a.download =
        format === "jpeg"
          ? `${defaults.slug}-vertical.jpg`
          : `${defaults.slug}-vertical.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Erro no download.");
    } finally {
      setDownloading(null);
    }
  }

  function addNearbyPoint() {
    if (nearbyPoints.length >= 6) return;
    setNearbyPoints((prev) => [...prev, { iconId: "shopping", label: "" }]);
  }

  function updateNearby(index: number, patch: Partial<FolderNearbyPoint>) {
    setNearbyPoints((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p))
    );
  }

  function removeNearby(index: number) {
    setNearbyPoints((prev) => prev.filter((_, i) => i !== index));
  }

  function updateHighlight(index: number, patch: Partial<FolderHighlight>) {
    setHighlights((prev) =>
      prev.map((h, i) => (i === index ? { ...h, ...patch } : h))
    );
  }

  function pickPhoto(url: string) {
    if (swapSlot === null) return;
    setPhotoUrls((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[swapSlot] = url;
      return next;
    });
    setSwapSlot(null);
  }

  const fieldClass =
    "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600";
  const labelClass = "block text-sm font-medium text-zinc-200";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8 rounded-xl border border-zinc-700 bg-zinc-900/60 p-6">
        <section>
          <h2 className="text-lg font-semibold text-white">Identidade</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="developmentName">
                Nome do empreendimento
              </label>
              <input
                id="developmentName"
                className={fieldClass}
                value={developmentName}
                onChange={(e) => setDevelopmentName(e.target.value)}
                maxLength={52}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="subtitle">
                Subtítulo (caixa alta)
              </label>
              <input
                id="subtitle"
                className={fieldClass}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={40}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="neighborhood">
                Bairro
              </label>
              <input
                id="neighborhood"
                className={fieldClass}
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                onBlur={() =>
                  setNeighborhood((v) => sanitizeNeighborhoodLabel(v))
                }
                maxLength={32}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="bedrooms">
                Quartos
              </label>
              <input
                id="bedrooms"
                type="number"
                min={0}
                max={99}
                className={fieldClass}
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Fotos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {([0, 1, 2] as const).map((slot) => (
              <div
                key={slot}
                className="rounded-lg border border-zinc-600 bg-zinc-800/80 p-3"
              >
                <p className="text-xs font-medium text-zinc-300">{SLOT_LABELS[slot]}</p>
                <div className="relative mt-2 aspect-[3/4] overflow-hidden rounded-md bg-zinc-700">
                  {photoUrls[slot] ? (
                    <Image
                      src={photoUrls[slot]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="200px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                      Sem foto
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg border border-zinc-500 bg-zinc-700 px-2 py-1.5 text-xs font-semibold text-white hover:bg-zinc-600"
                  onClick={() => setSwapSlot(slot)}
                >
                  Trocar foto
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">Localização</h2>
            <button
              type="button"
              disabled={loadingAi}
              onClick={() => void handleSuggestLocation()}
              className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-60"
            >
              {loadingAi ? "Gerando…" : "Sugerir com IA"}
            </button>
          </div>
          <label className={`${labelClass} mt-3`} htmlFor="locationText">
            Texto de localização (máx. 320)
          </label>
          <textarea
            id="locationText"
            className={`${fieldClass} min-h-[88px]`}
            value={locationText}
            onChange={(e) => setLocationText(e.target.value.slice(0, 320))}
            maxLength={320}
          />
          <p className="mt-1 text-xs text-zinc-400">{locationText.length}/320 · {city}</p>
        </section>

        <section>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">Pontos próximos</h2>
            <button
              type="button"
              onClick={addNearbyPoint}
              disabled={nearbyPoints.length >= 6}
              className="text-xs font-semibold text-green-400 hover:text-green-300 disabled:opacity-50"
            >
              + Adicionar
            </button>
          </div>
          <ul className="mt-3 space-y-3">
            {nearbyPoints.map((point, index) => (
              <li
                key={`nearby-${index}`}
                className="flex flex-wrap items-end gap-2 rounded-lg border border-zinc-700 p-3"
              >
                <div>
                  <label className="text-xs text-zinc-400">Ícone</label>
                  <select
                    className={fieldClass}
                    value={point.iconId}
                    onChange={(e) =>
                      updateNearby(index, {
                        iconId: e.target.value as FolderNearbyIconId,
                      })
                    }
                  >
                    {FOLDER_NEARBY_ICON_IDS.map((id) => (
                      <option key={id} value={id}>
                        {NEARBY_ICON_LABELS[id]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[180px] flex-1">
                  <label className="text-xs text-zinc-400">Legenda</label>
                  <input
                    className={fieldClass}
                    value={point.label}
                    onChange={(e) =>
                      updateNearby(index, { label: e.target.value.slice(0, 28) })
                    }
                    maxLength={28}
                  />
                </div>
                <button
                  type="button"
                  className="text-xs text-red-400 hover:text-red-300"
                  onClick={() => removeNearby(index)}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Diferenciais (3)</h2>
          <ul className="mt-3 space-y-3">
            {highlights.map((h, index) => (
              <li
                key={`hl-${index}`}
                className="grid gap-2 rounded-lg border border-zinc-700 p-3 sm:grid-cols-[140px_1fr]"
              >
                <div>
                  <label className="text-xs text-zinc-400">Ícone</label>
                  <select
                    className={fieldClass}
                    value={h.iconId}
                    onChange={(e) =>
                      updateHighlight(index, {
                        iconId: e.target.value as FolderHighlightIconId,
                      })
                    }
                  >
                    {FOLDER_HIGHLIGHT_ICON_IDS.map((id) => (
                      <option key={id} value={id}>
                        {HIGHLIGHT_ICON_LABELS[id]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Texto</label>
                  <input
                    className={fieldClass}
                    value={h.text}
                    onChange={(e) =>
                      updateHighlight(index, { text: e.target.value.slice(0, 56) })
                    }
                    maxLength={56}
                    placeholder="Ex.: Piscina adulto e infantil"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="seal">
              Selo
            </label>
            <select
              id="seal"
              className={fieldClass}
              value={seal}
              onChange={(e) => setSeal(e.target.value as FolderSealPreset)}
            >
              {FOLDER_SEAL_PRESETS.map((id) => (
                <option key={id} value={id}>
                  {SEAL_LABELS[id]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="footerPhrase">
              Frase do rodapé
            </label>
            <input
              id="footerPhrase"
              className={fieldClass}
              value={footerPhrase}
              onChange={(e) => setFooterPhrase(e.target.value.slice(0, 48))}
              maxLength={48}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-200 sm:col-span-2">
            <input
              type="checkbox"
              checked={showWhatsApp}
              onChange={(e) => setShowWhatsApp(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-500"
            />
            Mostrar WhatsApp no rodapé
          </label>
        </section>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4">
          <h2 className="text-sm font-semibold text-white">Pré-visualização</h2>
          <p className="mt-1 text-xs text-zinc-400">1080×1920 · Status / Story</p>
          <div className="relative mt-3 aspect-[9/16] overflow-hidden rounded-lg bg-zinc-800">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Pré-visualização do folder vertical"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                {loadingPreview ? "Gerando…" : "Aguardando…"}
              </div>
            )}
          </div>
          {previewError ? (
            <p className="mt-2 text-xs text-amber-400">{previewError}</p>
          ) : null}
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              disabled={downloading !== null || loadingPreview}
              onClick={() => void handleDownload("jpeg")}
              className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
            >
              {downloading === "jpeg"
                ? "Baixando JPG…"
                : "Baixar JPG (WhatsApp — recomendado)"}
            </button>
            <button
              type="button"
              disabled={downloading !== null || loadingPreview}
              onClick={() => void handleDownload("png")}
              className="w-full rounded-lg border border-zinc-500 bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-700 disabled:opacity-60"
            >
              {downloading === "png" ? "Baixando PNG…" : "Baixar PNG"}
            </button>
          </div>
        </div>
      </div>

      {swapSlot !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal
          aria-label="Escolher foto da galeria"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-zinc-600 bg-zinc-900 p-4 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-white">
                Trocar {SLOT_LABELS[swapSlot]}
              </h3>
              <button
                type="button"
                className="text-sm text-zinc-400 hover:text-white"
                onClick={() => setSwapSlot(null)}
              >
                Fechar
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {defaults.gallery.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  className="overflow-hidden rounded-lg border border-zinc-600 text-left hover:border-green-500"
                  onClick={() => pickPhoto(img.url)}
                >
                  <div className="relative aspect-[4/3] bg-zinc-800">
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="240px"
                      unoptimized
                    />
                  </div>
                  <p className="truncate px-2 py-1 text-xs text-zinc-300">
                    {img.environmentLabel}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
