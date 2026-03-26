"use client";

import { useRef, useState } from "react";
import { uploadPropertyImageAction } from "@/lib/admin/actions";
import { validatePropertyImage } from "@/lib/upload/validation";
import { generateFeaturedImageAlt } from "@/lib/utils/featuredImageAlt";
import {
  IMAGE_ENVIRONMENTS,
  OTHER_ENVIRONMENT_VALUE,
} from "@/lib/constants/image-environments";

export type GalleryImageItem = {
  url: string;
  alt: string;
  environment: string;
  environmentCustom: string;
  isPrimary: boolean;
  isHidden: boolean;
  sortOrder: number;
};

function ImageGuidance() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
      <p className="font-medium text-zinc-700">Orientações para SEO e performance</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        <li>Formatos aceitos: JPG, JPEG, PNG</li>
        <li>Tamanho máximo: 5MB por imagem</li>
        <li>Recomendado: até 2000px de largura</li>
        <li>Imagens devem ser otimizadas para web</li>
        <li>O alt da imagem ajuda no SEO e acessibilidade</li>
      </ul>
    </div>
  );
}

type PropertyImageGalleryProps = {
  images: GalleryImageItem[];
  onImagesChange: React.Dispatch<React.SetStateAction<GalleryImageItem[]>>;
  formRef: React.RefObject<HTMLFormElement | null>;
  cityValue: string;
};

export function PropertyImageGallery({
  images,
  onImagesChange,
  formRef,
  cityValue,
}: PropertyImageGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function readFormContext(): { type: string; neighborhood: string } {
    const form = formRef.current;
    if (!form) return { type: "", neighborhood: "" };
    const type = (form.elements.namedItem("type") as HTMLSelectElement | null)?.value ?? "";
    const neighborhood = (form.elements.namedItem("neighborhood") as HTMLInputElement | null)?.value ?? "";
    return { type, neighborhood };
  }

  function suggestAlt(environment: string): string {
    const { type, neighborhood } = readFormContext();
    return generateFeaturedImageAlt({ type, neighborhood, city: cityValue, environment });
  }

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadError(null);
    setUploadLoading(true);

    const validFiles: { file: File; previewUrl: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const err = validatePropertyImage(file);
      if (err) {
        setUploadError(`${file.name}: ${err}`);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      validFiles.push({ file, previewUrl });
    }

    if (validFiles.length === 0) {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const startCount = images.length;
    const newItems: GalleryImageItem[] = validFiles.map(({ previewUrl }, i) => ({
      url: previewUrl,
      alt: "",
      environment: "",
      environmentCustom: "",
      isPrimary: startCount === 0 && i === 0,
      isHidden: false,
      sortOrder: startCount + i,
    }));

    onImagesChange([...images, ...newItems]);

    try {
      for (let i = 0; i < validFiles.length; i++) {
        setUploadProgress(`Enviando ${i + 1} de ${validFiles.length}...`);
        const { file, previewUrl } = validFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadPropertyImageAction({}, formData);
        if (result.url) {
          onImagesChange((prev) =>
            prev.map((item) =>
              item.url === previewUrl ? { ...item, url: result.url! } : item
            )
          );
          URL.revokeObjectURL(previewUrl);
        } else if (result.error) {
          setUploadError(`${file.name}: ${result.error}`);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar imagens";
      setUploadError(msg);
    } finally {
      setUploadLoading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function setPrimary(index: number) {
    onImagesChange(
      images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index);
    if (next.length > 0 && images[index].isPrimary) {
      next[0].isPrimary = true;
    }
    onImagesChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  }

  function toggleHidden(index: number) {
    onImagesChange(
      images.map((img, i) =>
        i === index ? { ...img, isHidden: !img.isHidden } : img
      )
    );
  }

  function updateImage(index: number, updates: Partial<GalleryImageItem>) {
    onImagesChange(
      images.map((img, i) => (i === index ? { ...img, ...updates } : img))
    );
  }

  function handleEnvironmentChange(index: number, value: string) {
    const env =
      value === OTHER_ENVIRONMENT_VALUE
        ? ""
        : IMAGE_ENVIRONMENTS.find((e) => e.value === value)?.label ?? "";
    const alt = env ? suggestAlt(env) : "";
    updateImage(index, {
      environment: value,
      environmentCustom: value === OTHER_ENVIRONMENT_VALUE ? "" : "",
      alt,
    });
  }

  function handleEnvironmentCustomChange(index: number, value: string) {
    const alt = value.trim() ? suggestAlt(value) : "";
    updateImage(index, { environmentCustom: value, alt });
  }

  return (
    <div className="space-y-4">
      <ImageGuidance />
      <div>
        <label
          htmlFor="galleryFiles"
          className="block text-sm font-medium text-zinc-700"
        >
          Adicionar fotos
        </label>
        <input
          ref={fileInputRef}
          id="galleryFiles"
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
          multiple
          onChange={handleFilesSelected}
          disabled={uploadLoading}
          className="mt-1 block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
        />
        {uploadLoading && (
          <p className="mt-1 text-sm text-zinc-500">
            {uploadProgress ?? "Enviando imagens..."}
          </p>
        )}
        {uploadError && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">Erro no upload</p>
            <p className="mt-1 text-sm text-red-600">{uploadError}</p>
            <p className="mt-2 text-xs text-red-500">
              Verifique se as variáveis CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET estão definidas no .env
            </p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, index) => (
            <div
              key={`${img.url}-${index}`}
              className={`rounded-xl border p-4 ${
                img.isHidden ? "border-amber-200 bg-amber-50/50 opacity-75" : "border-zinc-200 bg-white"
              } ${img.isPrimary ? "ring-2 ring-green-500 ring-offset-2" : ""}`}
            >
              {img.isPrimary && (
                <span className="mb-2 inline-block rounded bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                  Imagem principal
                </span>
              )}
              {img.isHidden && (
                <span className="mb-2 inline-block rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                  Oculto
                </span>
              )}
              {img.url.startsWith("blob:") && !uploadLoading && (
                <span className="mb-2 inline-block rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                  Upload falhou — não será salva
                </span>
              )}
              <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100">
                <img
                  src={img.url}
                  alt={img.alt || "Preview"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPrimary(index)}
                    title="Definir como principal"
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      img.isPrimary
                        ? "bg-green-600 text-white"
                        : "bg-white/90 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    Principal
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleHidden(index)}
                    title={img.isHidden ? "Exibir" : "Ocultar"}
                    className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    {img.isHidden ? "Exibir" : "Ocultar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    title="Excluir"
                    className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-600">
                    Ambiente
                  </label>
                  <select
                    value={img.environment}
                    onChange={(e) => handleEnvironmentChange(index, e.target.value)}
                    className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">Selecione</option>
                    {IMAGE_ENVIRONMENTS.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                  {img.environment === OTHER_ENVIRONMENT_VALUE && (
                    <input
                      type="text"
                      value={img.environmentCustom}
                      onChange={(e) =>
                        handleEnvironmentCustomChange(index, e.target.value)
                      }
                      placeholder="Digite o ambiente"
                      className="mt-1 block w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600">
                    Alt (legenda)
                  </label>
                  <div className="mt-0.5 flex gap-1">
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => updateImage(index, { alt: e.target.value })}
                      placeholder={
                        img.environment || img.environmentCustom
                          ? "Preencha tipo e cidade para gerar automaticamente"
                          : "Texto alternativo"
                      }
                      className="block flex-1 rounded border border-zinc-300 px-2 py-1.5 text-sm"
                    />
                    {(img.environment || img.environmentCustom) && (
                      <button
                        type="button"
                        onClick={() => {
                          const env =
                            img.environment === "__OTHER__"
                              ? img.environmentCustom
                              : IMAGE_ENVIRONMENTS.find(
                                  (e) => e.value === img.environment
                                )?.label ?? "";
                          const alt = env ? suggestAlt(env) : "";
                          if (alt) updateImage(index, { alt });
                        }}
                        title="Regenerar alt com base em tipo, bairro, cidade e ambiente"
                        className="rounded border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                      >
                        Regenerar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
