"use client";

import {
  type FormEvent,
  startTransition,
  useActionState,
  useState,
} from "react";
import Link from "next/link";
import {
  createNeighborhoodAction,
  updateNeighborhoodAction,
  type NeighborhoodFormState,
} from "@/lib/admin/neighborhood-actions";
import { CEARA_CITIES, CEARA_STATE } from "@/lib/constants/cities";
import {
  BRAZIL_STATE_OPTIONS,
  OTHER_STATE_VALUE,
  resolveStateFormState,
} from "@/lib/constants/brazil-states";

type EditInitialData = {
  id: string;
  name: string;
  city: string;
  state: string;
};

type PrefillData = {
  city?: string;
  state?: string;
};

type Props = {
  mode: "create" | "edit";
  initialData?: EditInitialData;
  prefill?: PrefillData;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export function AdminNeighborhoodForm({ mode, initialData, prefill }: Props) {
  const action = mode === "create" ? createNeighborhoodAction : updateNeighborhoodAction;
  const [state, formAction, pending] = useActionState<
    NeighborhoodFormState,
    FormData
  >(action, {});

  const d = initialData;
  const seedCity = d?.city ?? prefill?.city ?? "";
  const seedState = d?.state ?? prefill?.state ?? "";

  const isCityInList = seedCity
    ? (CEARA_CITIES as readonly string[]).includes(seedCity)
    : true;

  const resolvedState = seedState
    ? resolveStateFormState(seedState)
    : d
      ? resolveStateFormState(d.state)
      : null;
  const isOtherState = resolvedState?.selectValue === OTHER_STATE_VALUE;

  const [cityMode, setCityMode] = useState<"list" | "manual">(
    seedCity && !isCityInList ? "manual" : "list"
  );
  const [citySelect, setCitySelect] = useState(
    seedCity && isCityInList ? seedCity : CEARA_CITIES[0]
  );
  const [manualCity, setManualCity] = useState(
    seedCity && !isCityInList ? seedCity : ""
  );
  const [stateSelect, setStateSelect] = useState(
    resolvedState?.selectValue ??
      BRAZIL_STATE_OPTIONS.find((s) => s.uf === CEARA_STATE)?.name ??
      ""
  );
  const [customState, setCustomState] = useState(resolvedState?.customState ?? "");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("cityMode", cityMode);
    if (cityMode === "list") {
      formData.set("city", citySelect);
    } else {
      formData.set("cityManual", manualCity);
    }
    formData.set(
      "stateMode",
      stateSelect === OTHER_STATE_VALUE ? "manual" : "list"
    );
    if (stateSelect === OTHER_STATE_VALUE) {
      formData.set("stateManual", customState);
    } else {
      formData.set("state", stateSelect);
    }
    startTransition(() => formAction(formData));
  }

  const errors = state.errors ?? {};

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl space-y-5 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
    >
      {mode === "edit" && d ? (
        <input type="hidden" name="id" value={d.id} />
      ) : null}

      {errors._form ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors._form}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
          Nome do bairro *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={d?.name ?? ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          placeholder="Ex.: Montese"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Variações como montese ou MONTESE serão reconhecidas como o mesmo bairro.
        </p>
        <FieldError message={errors.name} />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4">
        <p className="text-sm font-medium text-zinc-800">Localização</p>

        <div className="mt-3">
          <span className="block text-sm font-medium text-zinc-700">Cidade *</span>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2">
              <input
                type="radio"
                checked={cityMode === "list"}
                onChange={() => setCityMode("list")}
              />
              Lista (região Ceará)
            </label>
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2">
              <input
                type="radio"
                checked={cityMode === "manual"}
                onChange={() => setCityMode("manual")}
              />
              Digitar manualmente
            </label>
          </div>

          {cityMode === "list" ? (
            <select
              id="city"
              name="city"
              value={citySelect}
              onChange={(e) => setCitySelect(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900"
            >
              {CEARA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="cityManual"
              name="cityManual"
              type="text"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900"
              placeholder="Nome da cidade"
            />
          )}
          <FieldError message={errors.city} />
        </div>

        <div className="mt-4">
          <label htmlFor="stateSelect" className="block text-sm font-medium text-zinc-700">
            Estado *
          </label>
          <select
            id="stateSelect"
            value={stateSelect}
            onChange={(e) => setStateSelect(e.target.value)}
            required
            className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900"
          >
            <option value="">Selecione o estado</option>
            {BRAZIL_STATE_OPTIONS.map((s) => (
              <option key={s.uf} value={s.name}>
                {s.name} ({s.uf})
              </option>
            ))}
            <option value={OTHER_STATE_VALUE}>Outro — digitar manualmente</option>
          </select>
          {stateSelect === OTHER_STATE_VALUE ? (
            <input
              id="stateManual"
              name="stateManual"
              type="text"
              required
              value={customState}
              onChange={(e) => setCustomState(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900"
              placeholder="Nome ou UF do estado"
            />
          ) : null}
          <FieldError message={errors.state} />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/bairros"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {pending ? "Salvando…" : mode === "create" ? "Cadastrar bairro" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
