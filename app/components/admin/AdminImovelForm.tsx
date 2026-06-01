"use client";

import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  createPropertyAction,
  updatePropertyAction,
  generatePropertyContentAction,
  type CreatePropertyState,
  type UpdatePropertyState,
} from "@/lib/admin/actions";
import {
  PROPERTY_PRICE_ON_REQUEST_LABEL,
  propertyPriceFormDefaultValue,
} from "@/lib/utils/property-price";
import {
  BRAZIL_STATE_OPTIONS,
  DEFAULT_PROPERTY_COUNTRY,
  OTHER_STATE_VALUE,
  resolveStateFormState,
} from "@/lib/constants/brazil-states";
import { CEARA_CITIES, CEARA_STATE } from "@/lib/constants/cities";
import {
  PropertyImageGallery,
  type GalleryImageItem,
} from "@/app/components/admin/PropertyImageGallery";
import { PropertyDescriptionEditor } from "@/app/components/admin/PropertyDescriptionEditor";
import type { RegisteredNeighborhoodOption } from "@/lib/admin/neighborhood-queries";
import type { RegisteredBuilderOption } from "@/lib/admin/builder-queries";
import type { RegisteredCityOption } from "@/lib/admin/city-queries";
import {
  buildAdminNewNeighborhoodUrl,
  buildPropertyLocationKey,
} from "@/lib/admin/property-location-key";
import {
  countWordsInPropertyDescription,
  getDescriptionSeoHint,
  getTitleSeoHint,
} from "@/lib/utils/property-seo-editorial";

export type EditFormInitialData = {
  title: string;
  slug: string;
  description: string;
  price: string;
  city: string;
  neighborhood: string;
  /** Logradouro e nº — cadastro interno */
  street?: string;
  streetNumber?: string;
  state: string;
  country: string;
  postalCode: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  areaMin: string;
  areaMax: string;
  status: "DISPONIVEL" | "VENDIDO";
  isFeatured: boolean;
  isLaunch: boolean;
  isOpportunity: boolean;
  ownerName: string;
  ownerPhone: string;
  builderName: string;
  youtubeVideoId: string;
  images: GalleryImageItem[];
};

type AdminImovelFormProps = {
  mode?: "create" | "edit";
  propertyId?: string;
  initialData?: EditFormInitialData;
  registeredNeighborhoods?: RegisteredNeighborhoodOption[];
  registeredBuilders?: RegisteredBuilderOption[];
  registeredCities?: RegisteredCityOption[];
};

const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: "CASA", label: "Casa" },
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "COBERTURA", label: "Cobertura" },
  { value: "TERRENO", label: "Terreno" },
  { value: "LOTE", label: "Lote" },
  { value: "FAZENDA", label: "Fazenda" },
  { value: "COMERCIAL", label: "Comercial" },
  { value: "STUDIO", label: "Studio" },
];

const createInitialState: CreatePropertyState = {};
const updateInitialState: UpdatePropertyState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function TitleSeoCounter({ charCount }: { charCount: number }) {
  const { status, message } = getTitleSeoHint(charCount);
  const toneClass =
    status === "good" ? "text-green-700" : "text-amber-700";
  return <p className={`mt-1 text-xs ${toneClass}`}>{message}</p>;
}

function DescriptionSeoCounter({ wordCount }: { wordCount: number }) {
  const { status, message } = getDescriptionSeoHint(wordCount);
  const toneClass =
    status === "adequate" ? "text-green-700" : "text-amber-700";
  return <p className={`mt-1 text-xs ${toneClass}`}>{message}</p>;
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
  registeredNeighborhoods = [],
  registeredBuilders = [],
  registeredCities = [],
}: AdminImovelFormProps) {
  const action = mode === "edit" ? updatePropertyAction : createPropertyAction;
  const initialState = mode === "edit" ? updateInitialState : createInitialState;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const errors = state?.errors ?? {};

  const d = initialData;
  const formRef = useRef<HTMLFormElement>(null);
  const [titleInput, setTitleInput] = useState(d?.title ?? "");

  const [descriptionHtml, setDescriptionHtml] = useState(d?.description ?? "");
  const [descriptionEditorKey, setDescriptionEditorKey] = useState(0);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const cityFromData = initialData?.city ?? "";
  const cityListOptions = (() => {
    const names = new Set<string>(CEARA_CITIES);
    for (const rc of registeredCities) {
      names.add(rc.name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "pt-BR"));
  })();
  const isCityInList = cityListOptions.includes(cityFromData);
  const [cityEntryMode, setCityEntryMode] = useState<"lista" | "manual">(
    initialData ? (isCityInList ? "lista" : "manual") : "lista"
  );
  const [citySelect, setCitySelect] = useState(
    initialData && isCityInList ? cityFromData : ""
  );
  const [manualCity, setManualCity] = useState(
    initialData && !isCityInList ? cityFromData : ""
  );
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>(
    initialData?.images ?? []
  );

  const resolvedStateInitial = initialData
    ? resolveStateFormState(initialData.state)
    : resolveStateFormState(CEARA_STATE);
  const [stateSelect, setStateSelect] = useState(resolvedStateInitial.selectValue);
  const [customState, setCustomState] = useState(resolvedStateInitial.customState);
  const isOtherState = stateSelect === OTHER_STATE_VALUE;

  const cityValue = cityEntryMode === "lista" ? citySelect : manualCity;
  const stateValue = isOtherState ? customState : stateSelect;
  const locationKey = buildPropertyLocationKey({
    city: cityValue,
    state: stateValue,
    registeredCities,
  });

  const neighborhoodOptions = registeredNeighborhoods.filter(
    (n) => `${n.citySlug}::${n.stateSlug}` === locationKey
  );
  const hasRegisteredNeighborhoods = neighborhoodOptions.length > 0;

  const [neighborhood, setNeighborhood] = useState(d?.neighborhood ?? "");
  const prevLocationKeyRef = useRef(locationKey);

  useEffect(() => {
    if (
      prevLocationKeyRef.current &&
      prevLocationKeyRef.current !== locationKey
    ) {
      setNeighborhood("");
    }
    prevLocationKeyRef.current = locationKey;
  }, [locationKey]);

  const neighborhoodLegacyOption =
    neighborhood &&
    hasRegisteredNeighborhoods &&
    !neighborhoodOptions.some((n) => n.name === neighborhood);
  const [builderName, setBuilderName] = useState(d?.builderName ?? "");
  const [ownerName, setOwnerName] = useState(d?.ownerName ?? "");
  const [ownerPhone, setOwnerPhone] = useState(d?.ownerPhone ?? "");

  function applyRegisteredBuilder(builderId: string) {
    const builder = registeredBuilders.find((b) => b.id === builderId);
    if (!builder) return;
    setBuilderName(builder.name);
    setOwnerName(builder.contactName ?? "");
    setOwnerPhone(builder.contactPhone ?? "");
  }

  function submitPropertyForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("description", descriptionHtml);
    fd.set("imagesData", JSON.stringify(galleryImages));
    // React 19: dispatch manual do useActionState tem de ir dentro de startTransition.
    startTransition(() => {
      formAction(fd);
    });
  }

  async function handleGenerateAi() {
    const form = formRef.current;
    if (!form) return;
    setAiError(null);
    setAiLoading(true);
    try {
      const formData = new FormData(form);
      formData.set("description", descriptionHtml);
      const result = await generatePropertyContentAction({}, formData);
      if (result.error) {
        setAiError(result.error);
      } else if (!result.title?.trim() && !result.description?.trim()) {
        setAiError("A IA não devolveu título nem descrição. Tente de novo ou verifique GEMINI_API_KEY.");
      } else {
        if (result.title?.trim()) {
          setTitleInput(result.title.trim());
        }
        if (result.description?.trim()) {
          setDescriptionHtml(result.description.trim());
          setDescriptionEditorKey((k) => k + 1);
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao chamar o assistente de IA.";
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  }

  const formError = errors._form;
  const descriptionWordCount = countWordsInPropertyDescription(descriptionHtml);

  return (
    <form ref={formRef} className="space-y-6" onSubmit={submitPropertyForm}>
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
          className="text-sm text-zinc-200 transition-colors hover:text-white"
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
            id="title"
            name="title"
            type="text"
            required
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Ex: Apartamento 3 quartos com vista"
          />
          <TitleSeoCounter charCount={titleInput.length} />
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
          <span className="block text-sm font-medium text-zinc-700" id="description-label">
            Descrição
          </span>
          <p className="mt-1 text-xs text-zinc-500">
            Use a barra de ferramentas para negrito, títulos, listas e alinhamento. O texto
            é guardado em HTML e aparece formatado no site.
          </p>
          <div className="mt-2" aria-labelledby="description-label">
            <PropertyDescriptionEditor
              key={descriptionEditorKey}
              value={descriptionHtml}
              onChange={setDescriptionHtml}
            />
          </div>
          <DescriptionSeoCounter wordCount={descriptionWordCount} />
          <FieldError message={errors.description} />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-zinc-700">
            Preço (R$)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={propertyPriceFormDefaultValue(d?.price)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder={PROPERTY_PRICE_ON_REQUEST_LABEL}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Deixe vazio para exibir &quot;{PROPERTY_PRICE_ON_REQUEST_LABEL}&quot; no site.
          </p>
          <FieldError message={errors.price} />
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4">
          <p className="text-sm font-medium text-zinc-800">Localização</p>
          <p className="mt-1 text-xs text-zinc-500">
            Cidade e estado podem ser escolhidos na lista ou digitados manualmente. Bairro,
            endereço e nº são opcionais e servem para cadastro interno.
          </p>
        </div>

        <div>
          <span className="block text-sm font-medium text-zinc-700">Cidade *</span>
          <fieldset className="mt-2 space-y-3">
            <legend className="sr-only">Modo de preenchimento da cidade</legend>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input
                  type="radio"
                  name="cityEntryModeUi"
                  checked={cityEntryMode === "lista"}
                  onChange={() => {
                    setCityEntryMode("lista");
                    if (manualCity && cityListOptions.includes(manualCity)) {
                      setCitySelect(manualCity);
                    }
                  }}
                  className="h-4 w-4 border-zinc-300 text-green-700 focus:ring-green-600"
                />
                Lista (região Ceará)
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input
                  type="radio"
                  name="cityEntryModeUi"
                  checked={cityEntryMode === "manual"}
                  onChange={() => {
                    setCityEntryMode("manual");
                    if (citySelect) setManualCity(citySelect);
                  }}
                  className="h-4 w-4 border-zinc-300 text-green-700 focus:ring-green-600"
                />
                Digitar manualmente
              </label>
            </div>
            {cityEntryMode === "lista" ? (
              <>
                <select
                  id="citySelect"
                  value={citySelect}
                  onChange={(e) => {
                    const nextCity = e.target.value;
                    setCitySelect(nextCity);
                    const match = registeredCities.find((c) => c.name === nextCity);
                    if (match) {
                      const resolved = resolveStateFormState(match.state);
                      setStateSelect(resolved.selectValue);
                      setCustomState(resolved.customState);
                    }
                  }}
                  required
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                >
                  <option value="">Selecione a cidade</option>
                  {cityListOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="city" value={citySelect} readOnly />
              </>
            ) : (
              <input
                id="city"
                name="city"
                type="text"
                required
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                placeholder="Ex: Trairi — Ceará, São Paulo"
              />
            )}
          </fieldset>
          <FieldError message={errors.city} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="neighborhood" className="block text-sm font-medium text-zinc-700">
              Bairro
            </label>
            {hasRegisteredNeighborhoods ? (
              <>
                <select
                  id="neighborhood"
                  name="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                >
                  <option value="">Selecione o bairro…</option>
                  {neighborhoodOptions.map((n) => (
                    <option key={n.id} value={n.name}>
                      {n.name}
                    </option>
                  ))}
                  {neighborhoodLegacyOption ? (
                    <option value={neighborhood}>{neighborhood} (atual)</option>
                  ) : null}
                </select>
                <p className="mt-1 text-xs text-zinc-500">
                  {neighborhoodOptions.length}{" "}
                  {neighborhoodOptions.length === 1
                    ? "bairro cadastrado"
                    : "bairros cadastrados"}{" "}
                  para {cityValue.trim() || "esta cidade"}.
                </p>
              </>
            ) : (
              <>
                <input
                  id="neighborhood"
                  name="neighborhood"
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                  placeholder="Digite manualmente, ex.: Jardim Paraíso"
                />
                {cityValue.trim() && stateValue.trim() ? (
                  <div className="mt-2 space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <p className="text-xs text-amber-900">
                      Nenhum bairro cadastrado para esta cidade.
                    </p>
                    <Link
                      href={buildAdminNewNeighborhoodUrl(cityValue, stateValue)}
                      className="inline-flex min-h-[40px] items-center rounded-md border border-green-700 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 transition-colors hover:bg-green-50"
                    >
                      Cadastrar bairro para {cityValue.trim()}
                    </Link>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-zinc-500">
                    Selecione cidade e estado para ver bairros cadastrados ou cadastrar um novo.
                  </p>
                )}
              </>
            )}
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-zinc-700">
              País
            </label>
            <input
              id="country"
              name="country"
              type="text"
              defaultValue={
                d?.country != null && d.country.trim() !== ""
                  ? d.country
                  : DEFAULT_PROPERTY_COUNTRY
              }
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Brasil"
            />
            <p className="mt-1 text-xs text-zinc-500">Opcional no cadastro interno.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_minmax(5.5rem,8rem)] sm:items-start">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-zinc-700">
              Endereço (logradouro)
            </label>
            <input
              id="street"
              name="street"
              type="text"
              defaultValue={d?.street}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Ex: Av. Beira Mar, Rua das Flores"
            />
            <p className="mt-1 text-xs text-zinc-500">Opcional — cadastro interno, não exibido no site.</p>
          </div>
          <div>
            <label htmlFor="streetNumber" className="block text-sm font-medium text-zinc-700">
              Nº
            </label>
            <input
              id="streetNumber"
              name="streetNumber"
              type="text"
              defaultValue={d?.streetNumber}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Ex: 1201, S/N"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="stateSelect" className="block text-sm font-medium text-zinc-700">
              Estado *
            </label>
            <select
              id="stateSelect"
              value={stateSelect}
              onChange={(e) => setStateSelect(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              <option value="">Selecione o estado</option>
              {BRAZIL_STATE_OPTIONS.map((s) => (
                <option key={s.uf} value={s.name}>
                  {s.name} ({s.uf})
                </option>
              ))}
              <option value={OTHER_STATE_VALUE}>Outro — digitar manualmente</option>
            </select>
            {isOtherState ? (
              <input
                id="state"
                name="state"
                type="text"
                required
                value={customState}
                onChange={(e) => setCustomState(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                placeholder="Nome do estado ou região"
              />
            ) : (
              <input type="hidden" name="state" value={stateSelect} readOnly />
            )}
            <FieldError message={errors.state} />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-zinc-700">
              CEP
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              defaultValue={d?.postalCode}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="00000-000"
            />
            <FieldError message={errors.postalCode} />
            <p className="mt-1 text-xs text-zinc-500">Opcional. Use 8 dígitos (com ou sem hífen).</p>
          </div>
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>

        <p className="text-sm font-medium text-zinc-700">Área privativa</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="areaMin" className="block text-sm font-medium text-zinc-700">
              Área mínima (m²)
            </label>
            <input
              id="areaMin"
              name="areaMin"
              type="number"
              min={0}
              step="0.01"
              defaultValue={d?.areaMin}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Ex: 48,95"
            />
            <FieldError message={errors.areaMin} />
          </div>
          <div>
            <label htmlFor="areaMax" className="block text-sm font-medium text-zinc-700">
              Área máxima (m²)
            </label>
            <input
              id="areaMax"
              name="areaMax"
              type="number"
              min={0}
              step="0.01"
              defaultValue={d?.areaMax}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Ex: 120"
            />
            <FieldError message={errors.areaMax} />
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          Área privativa. Para metragem única, preencha só a mínima. Para lançamentos com várias
          plantas, informe mínima e máxima.
        </p>
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
        <PropertyImageGallery
          images={galleryImages}
          onImagesChange={setGalleryImages}
          formRef={formRef}
          cityValue={cityValue}
        />
        <FieldError message={errors.images} />
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

      <FormBlock title="Construtora e contato (uso interno)">
        <p className="text-sm text-zinc-500">
          Estes dados não aparecem no portal público. Ao selecionar uma construtora
          cadastrada, responsável e telefone são preenchidos automaticamente.
        </p>
        <div>
          <label htmlFor="builderName" className="block text-sm font-medium text-zinc-700">
            Construtora
          </label>
          {registeredBuilders.length > 0 ? (
            <select
              id="builderSelect"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  applyRegisteredBuilder(e.target.value);
                }
              }}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              <option value="">Selecionar construtora cadastrada…</option>
              {registeredBuilders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : null}
          <input
            id="builderName"
            name="builderName"
            type="text"
            list={
              registeredBuilders.length > 0
                ? "property-builder-suggestions"
                : undefined
            }
            value={builderName}
            onChange={(e) => setBuilderName(e.target.value)}
            className={`block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 ${
              registeredBuilders.length > 0 ? "mt-2" : "mt-1"
            }`}
            placeholder="Ex.: Moura Dubeux"
          />
          {registeredBuilders.length > 0 ? (
            <datalist id="property-builder-suggestions">
              {registeredBuilders.map((b) => (
                <option key={b.id} value={b.name} />
              ))}
            </datalist>
          ) : null}
          <p className="mt-1 text-xs text-zinc-500">
            Cadastre em Admin → Construtoras. Nomes equivalentes (ex.: moura dubeux /
            MOURA DUBEUX) usam o cadastro canônico ao salvar.
          </p>
        </div>
        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium text-zinc-700">
            Responsável da construtora
          </label>
          <input
            id="ownerName"
            name="ownerName"
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Nome do responsável"
          />
        </div>
        <div>
          <label htmlFor="ownerPhone" className="block text-sm font-medium text-zinc-700">
            Telefone da construtora
          </label>
          <input
            id="ownerPhone"
            name="ownerPhone"
            type="tel"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
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
