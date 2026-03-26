"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createLeadAction,
  type CreateLeadState,
} from "@/lib/admin/lead-actions";
import {
  LEAD_PRICE_RANGE_OPTIONS,
  MANUAL_SOURCE_OPTIONS,
} from "@/lib/constants/leads";

const initialState: CreateLeadState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

/**
 * Formulário de cadastro manual de lead.
 * Client Component — usa useActionState com Server Action.
 */
export function AdminLeadForm() {
  const [state, formAction, isPending] = useActionState(
    createLeadAction,
    initialState
  );
  const errors = state?.errors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-700"
            >
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              disabled={isPending}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
              placeholder="Nome completo"
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-zinc-700"
            >
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              disabled={isPending}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
              placeholder="(85) 99999-9999"
            />
            <FieldError message={errors.phone} />
          </div>

          <div>
            <label
              htmlFor="desiredPriceRange"
              className="block text-sm font-medium text-zinc-700"
            >
              Faixa de valor desejado <span className="text-red-500">*</span>
            </label>
            <select
              id="desiredPriceRange"
              name="desiredPriceRange"
              required
              disabled={isPending}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
            >
              <option value="">Selecione uma faixa</option>
              {LEAD_PRICE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.desiredPriceRange} />
          </div>

          <div>
            <label
              htmlFor="manualSource"
              className="block text-sm font-medium text-zinc-700"
            >
              Origem (manual) <span className="text-red-500">*</span>
            </label>
            <select
              id="manualSource"
              name="manualSource"
              required
              disabled={isPending}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
            >
              <option value="">Selecione a origem</option>
              {MANUAL_SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.manualSource} />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-zinc-700"
            >
              Observação
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              disabled={isPending}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
              placeholder="Anotações internas (opcional)"
            />
            <FieldError message={errors.notes} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
        >
          {isPending ? "Salvando…" : "Salvar lead"}
        </button>
        <Link
          href="/admin/leads"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
