"use client";

import {
  type FormEvent,
  startTransition,
  useActionState,
  useState,
} from "react";
import Link from "next/link";
import {
  createCityAction,
  updateCityAction,
  type CityFormState,
} from "@/lib/admin/city-actions";
import {
  BRAZIL_STATE_OPTIONS,
  OTHER_STATE_VALUE,
  resolveStateFormState,
} from "@/lib/constants/brazil-states";
import { CEARA_STATE } from "@/lib/constants/cities";

type EditInitialData = {
  id: string;
  name: string;
  state: string;
};

type Props = {
  mode: "create" | "edit";
  initialData?: EditInitialData;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export function AdminCityForm({ mode, initialData }: Props) {
  const action = mode === "create" ? createCityAction : updateCityAction;
  const [state, formAction, pending] = useActionState<CityFormState, FormData>(
    action,
    {}
  );

  const d = initialData;
  const resolvedState = d ? resolveStateFormState(d.state) : null;
  const isOtherState = resolvedState?.selectValue === OTHER_STATE_VALUE;

  const [stateSelect, setStateSelect] = useState(
    resolvedState?.selectValue ??
      BRAZIL_STATE_OPTIONS.find((s) => s.uf === CEARA_STATE)?.name ??
      ""
  );
  const [customState, setCustomState] = useState(resolvedState?.customState ?? "");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
      {mode === "edit" && d ? <input type="hidden" name="id" value={d.id} /> : null}

      {errors._form ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors._form}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
          Nome da cidade *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={d?.name ?? ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          placeholder="Ex.: Fortaleza"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Variações como FORTALEZA ou Fortaleza-Ceará serão reconhecidas como a mesma
          cidade ao salvar imóveis.
        </p>
        <FieldError message={errors.name} />
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium text-zinc-700">
          Estado *
        </label>
        <select
          id="state"
          value={stateSelect}
          onChange={(e) => setStateSelect(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        >
          {BRAZIL_STATE_OPTIONS.map((opt) => (
            <option key={opt.uf} value={opt.name}>
              {opt.name} ({opt.uf})
            </option>
          ))}
          <option value={OTHER_STATE_VALUE}>Outro (digitar)</option>
        </select>
        {isOtherState ? (
          <input
            type="text"
            value={customState}
            onChange={(e) => setCustomState(e.target.value)}
            placeholder="Nome do estado"
            className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900"
          />
        ) : null}
        <FieldError message={errors.state} />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {pending ? "Salvando…" : mode === "create" ? "Cadastrar cidade" : "Salvar alterações"}
        </button>
        <Link
          href="/admin/cidades"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
