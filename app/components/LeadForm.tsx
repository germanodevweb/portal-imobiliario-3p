"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  submitLeadFromSiteAction,
  type SubmitLeadFromSiteState,
} from "@/lib/actions/lead";
import { LEAD_PRICE_RANGE_OPTIONS } from "@/lib/constants/leads";

const initialState: SubmitLeadFromSiteState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

type LeadFormProps = {
  /** Título da seção (opcional) */
  title?: string;
  /** Subtítulo/descrição (opcional) */
  subtitle?: string;
  /** Classes adicionais para o container */
  className?: string;
};

/**
 * Formulário público de captura de lead.
 * Reutilizável em home, investimento e outras páginas públicas.
 * Salva com origin=site, status=novo.
 */
export function LeadForm({ title, subtitle, className = "" }: LeadFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitLeadFromSiteAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.errors ?? {};

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state?.success]);

  return (
    <section
      className={className}
      aria-labelledby={title ? "lead-form-heading" : undefined}
    >
      {title && (
        <header className="mb-6">
          <h2
            id="lead-form-heading"
            className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
          )}
        </header>
      )}

      {state?.success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-medium text-green-800">
            Mensagem enviada com sucesso!
          </p>
          <p className="mt-1 text-sm text-green-700">
            Em breve nossa equipe entrará em contato.
          </p>
        </div>
      ) : (
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="lead-name"
              className="block text-sm font-medium text-zinc-700"
            >
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              id="lead-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              disabled={isPending}
              className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
              placeholder="Seu nome"
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <label
              htmlFor="lead-phone"
              className="block text-sm font-medium text-zinc-700"
            >
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              id="lead-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              disabled={isPending}
              className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
              placeholder="(85) 99999-9999"
            />
            <FieldError message={errors.phone} />
          </div>

          <div>
            <label
              htmlFor="lead-price-range"
              className="block text-sm font-medium text-zinc-700"
            >
              Faixa de valor desejada <span className="text-red-500">*</span>
            </label>
            <select
              id="lead-price-range"
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

          <button
            type="submit"
            disabled={isPending}
            className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
          >
            {isPending ? "Enviando…" : "Enviar"}
          </button>
        </form>
      )}
    </section>
  );
}
