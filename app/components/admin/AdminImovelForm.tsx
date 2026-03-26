"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  createPropertyAction,
  updatePropertyAction,
  generatePropertyContentAction,
  type CreatePropertyState,
  type UpdatePropertyState,
} from "@/lib/admin/actions";
import { CEARA_CITIES, CEARA_STATE, OTHER_CITY_VALUE } from "@/lib/constants/cities";
import {
  PropertyImageGallery,
  type GalleryImageItem,
} from "@/app/components/admin/PropertyImageGallery";

export type EditFormInitialData = {
  title: string;
  slug: string;
  description: string;
  price: string;
  city: string;
  neighborhood: string;
  state: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  area: string;
  status: "DISPONIVEL" | "VENDIDO";
  isFeatured: boolean;
  isLaunch: boolean;
  isOpportunity: boolean;
  ownerName: string;
  ownerPhone: string;
  youtubeVideoId: string;
  images: GalleryImageItem[];
};

type AdminImovelFormProps = {
  mode?: "create" | "edit";
  propertyId?: string;
  initialData?: EditFormInitialData;
};

const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: "CASA", label: "Casa" },
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "COBERTURA", label: "Cobertura" },
  { value: "TERRENO", label: "Terreno" },
  { value: "COMERCIAL", label: "Comercial" },
  { value: "STUDIO", label: "Studio" },
];

const createInitialState: CreatePropertyState = {};
const updateInitialState: UpdatePropertyState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function FormBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-zinc-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function AdminImovelForm({
  mode = "create",
  propertyId,
  initialData,
}: AdminImovelFormProps) {
  const action = mode === "edit" ? updatePropertyAction : createPropertyAction;
  const initialState = mode === "edit" ? updateInitialState : createInitialState;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const errors = state?.errors ?? {};

  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const cityFromData = initialData?.city ?? "";
  const isCityInList = CEARA_CITIES.includes(cityFromData as (typeof CEARA_CITIES)[number]);
  const [citySelect, setCitySelect] = useState<string>(
    initialData ? (isCityInList ? cityFromData : OTHER_CITY_VALUE) : ""
  );
  const [customCity, setCustomCity] = useState(
    initialData && !isCityInList ? cityFromData : ""
  );
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>(
    initialData?.images ?? []
  );

  const isOtherCity = citySelect === OTHER_CITY_VALUE;
  const cityValue = isOtherCity ? customCity : citySelect;

  async function handleGenerateAi() {
    const form = formRef.current;
    if (!form) return;
    setAiError(null);
    setAiLoading(true);
    try {
      const formData = new FormData(form);
      const result = await generatePropertyContentAction({}, formData);
      if (result.error) {
        setAiError(result.error);
      } else {
        if (result.title && titleRef.current) titleRef.current.value = result.title;
        if (result.description && descriptionRef.current)
          descriptionRef.current.value = result.description;
      }
    } finally {
      setAiLoading(false);
    }
  }

  const d = initialData;
  const formError = errors._form;

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {mode === "edit" && propertyId && (
        <input type="hidden" name="propertyId" value={propertyId} readOnly />
      )}
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{formError}</p>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/imoveis"
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← Voltar para imóveis
        </Link>
      </div>

      <FormBlock title="Informações do imóvel">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-700">
            Título *
          </label>
          <input
            ref={titleRef}
            id="title"
            name="title"
            type="text"
            required
            defaultValue={d?.title}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Ex: Apartamento 3 quartos com vista"
          />
          <FieldError message={errors.title} />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-zinc-700">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={d?.slug}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Deixe em branco para gerar automaticamente do título"
          />
          <FieldError message={errors.slug} />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
            Descrição
          </label>
          <textarea
            ref={descriptionRef}
            id="description"
            name="description"
            rows={4}
            defaultValue={d?.description}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Descrição detalhada do imóvel"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-zinc-700">
            Preço (R$) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min={1}
            step="0.01"
            defaultValue={d?.price}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Ex: 450000"
          />
          <FieldError message={errors.price} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-zinc-700">
              Cidade *
            </label>
            <select
              id="citySelect"
              value={citySelect}
              onChange={(e) => setCitySelect(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              <option value="">Selecione a cidade</option>
              {CEARA_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OTHER_CITY_VALUE}>Outra cidade</option>
            </select>
            {isOtherCity && (
              <input
                id="city"
                name="city"
                type="text"
                required
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                placeholder="Digite o nome da cidade"
              />
            )}
            {!isOtherCity && (
              <input type="hidden" name="city" value={cityValue} readOnly />
            )}
            <FieldError message={errors.city} />
          </div>
          <div>
            <label htmlFor="neighborhood" className="block text-sm font-medium text-zinc-700">
              Bairro
            </label>
            <input
              id="neighborhood"
              name="neighborhood"
              type="text"
              defaultValue={d?.neighborhood}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Ex: Praia de Iracema"
            />
          </div>
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-zinc-700">
            Estado *
          </label>
          <input
            id="state"
            name="state"
            type="text"
            required
            defaultValue={d?.state ?? CEARA_STATE}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="CE"
          />
          <FieldError message={errors.state} />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-zinc-700">
            Tipo de imóvel *
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={d?.type ?? ""}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          >
            <option value="">Selecione...</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.type} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-zinc-700">
              Quartos
            </label>
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={d?.bedrooms ?? 0}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
            <FieldError message={errors.bedrooms} />
          </div>
          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-zinc-700">
              Banheiros
            </label>
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={d?.bathrooms ?? 0}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
            <FieldError message={errors.bathrooms} />
          </div>
          <div>
            <label htmlFor="garage" className="block text-sm font-medium text-zinc-700">
              Vagas
            </label>
            <input
              id="garage"
              name="garage"
              type="number"
              min={0}
              defaultValue={d?.garage ?? 0}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
            <FieldError message={errors.garage} />
          </div>
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-zinc-700">
              Área total
            </label>
            <input
              id="area"
              name="area"
              type="number"
              min={0}
              step="0.01"
              defaultValue={d?.area}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Ex: 85"
            />
            <FieldError message={errors.area} />
          </div>
        </div>
      </FormBlock>

      <FormBlock title="Vídeo do imóvel (YouTube)">
        <p className="text-sm text-zinc-500">
          Cole a URL completa, o link curto ou apenas o ID do vídeo do YouTube.
        </p>
        <div>
          <label htmlFor="youtubeVideoId" className="block text-sm font-medium text-zinc-700">
            URL ou ID do vídeo
          </label>
          <input
            id="youtubeVideoId"
            name="youtubeVideoId"
            type="text"
            defaultValue={d?.youtubeVideoId}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="https://www.youtube.com/watch?v=ABC123 ou ABC123"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Deixe em branco para remover o vídeo. Ex: https://youtu.be/ABC123XYZ
          </p>
        </div>
      </FormBlock>

      <FormBlock title="Galeria de imagens">
        <input
          type="hidden"
          name="imagesData"
          value={JSON.stringify(galleryImages)}
          readOnly
        />
        <PropertyImageGallery
          images={galleryImages}
          onImagesChange={setGalleryImages}
          formRef={formRef}
          cityValue={cityValue}
        />
      </FormBlock>

      <FormBlock title="Status">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-zinc-700">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={d?.status ?? "DISPONIVEL"}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          >
            <option value="DISPONIVEL">Disponível</option>
            <option value="VENDIDO">Vendido</option>
          </select>
          <FieldError message={errors.status} />
        </div>
      </FormBlock>

      <FormBlock title="Status comercial">
        <p className="text-sm text-zinc-500">
          Selos exibidos no portal para destacar o imóvel.
        </p>
        <div className="flex flex-wrap gap-6">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={d?.isFeatured ?? false}
              className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-zinc-700">Destaque</span>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isLaunch"
              defaultChecked={d?.isLaunch ?? false}
              className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-zinc-700">Lançamento</span>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isOpportunity"
              defaultChecked={d?.isOpportunity ?? false}
              className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-zinc-700">Oportunidade</span>
          </label>
        </div>
      </FormBlock>

      <FormBlock title="Dados do proprietário (uso interno)">
        <p className="text-sm text-zinc-500">
          Estes dados não aparecem no portal público.
        </p>
        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium text-zinc-700">
            Nome do proprietário
          </label>
          <input
            id="ownerName"
            name="ownerName"
            type="text"
            defaultValue={d?.ownerName}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Nome completo"
          />
        </div>
        <div>
          <label htmlFor="ownerPhone" className="block text-sm font-medium text-zinc-700">
            Telefone do proprietário
          </label>
          <input
            id="ownerPhone"
            name="ownerPhone"
            type="tel"
            defaultValue={d?.ownerPhone}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="(85) 99999-9999"
          />
          <FieldError message={errors.ownerPhone} />
        </div>
      </FormBlock>

      <FormBlock title="Assistente de IA">
        <p className="text-sm text-zinc-500">
          Descreva o imóvel e gere sugestões de título e descrição. A IA não salva
          automaticamente — revise e salve manualmente.
        </p>
        <div>
          <label htmlFor="aiPrompt" className="block text-sm font-medium text-zinc-700">
            Observações do imóvel
          </label>
          <textarea
            id="aiPrompt"
            name="aiPrompt"
            rows={3}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Ex: Apartamento reformado, 3 quartos, sala ampla, cozinha planejada, vista para o mar..."
          />
        </div>
        <button
          type="button"
          onClick={handleGenerateAi}
          disabled={aiLoading}
          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {aiLoading ? "Gerando..." : "Gerar título e descrição com IA"}
        </button>
        {aiError && (
          <p className="text-sm text-red-600">{aiError}</p>
        )}
      </FormBlock>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </button>
        <Link
          href="/admin/imoveis"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Voltar
        </Link>
      </div>
    </form>
  );
}
