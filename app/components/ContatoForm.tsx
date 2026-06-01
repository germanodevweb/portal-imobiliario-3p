"use client";

import { useActionState } from "react";
import {
  submitContatoAction,
  type SubmitContatoState,
} from "@/lib/actions/contato";
import { CONTATO_ASSUNTO_OPTIONS } from "@/lib/constants/contato";
import { EMAIL_ERROR_MESSAGE } from "@/lib/utils/email";
import { WHATSAPP_PHONE_ERROR_MESSAGE, WHATSAPP_PHONE_EXAMPLE } from "@/lib/utils/phone";

const initialState: SubmitContatoState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export function ContatoForm() {
  const [state, formAction, isPending] = useActionState(
    submitContatoAction,
    initialState
  );
  const errors = state?.errors ?? {};

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 space-y-4"
      noValidate
    >
      {errors._form ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {errors._form}
        </div>
      ) : null}

      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-zinc-700">
          Nome completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          autoComplete="name"
          disabled={isPending}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
          placeholder=""
        />
        <FieldError message={errors.nome} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <div>
          <label
            htmlFor="telefone"
            className="block text-sm font-medium text-zinc-700"
          >
            DDD + Celular <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            autoComplete="tel"
            inputMode="tel"
            maxLength={16}
            disabled={isPending}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
            placeholder={WHATSAPP_PHONE_EXAMPLE}
            title={WHATSAPP_PHONE_ERROR_MESSAGE}
          />
          <FieldError message={errors.telefone} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
            E-mail <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            disabled={isPending}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
            placeholder="nome@email.com"
            title={EMAIL_ERROR_MESSAGE}
          />
          <FieldError message={errors.email} />
        </div>
      </div>

      <div>
        <label htmlFor="assunto" className="block text-sm font-medium text-zinc-700">
          Assunto <span className="text-red-500">*</span>
        </label>
        <select
          id="assunto"
          name="assunto"
          disabled={isPending}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 [&>option]:bg-white [&>option]:text-zinc-900 disabled:opacity-50"
        >
          {CONTATO_ASSUNTO_OPTIONS.map((opt) => (
            <option key={opt.value || "empty"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.assunto} />
      </div>

      <div>
        <label htmlFor="mensagem" className="block text-sm font-medium text-zinc-700">
          Deixe sua mensagem <span className="text-red-500">*</span>
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          rows={4}
          disabled={isPending}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
          placeholder=""
        />
        <FieldError message={errors.mensagem} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
      >
        {isPending ? "Enviando…" : "Enviar mensagem"}
      </button>
    </form>
  );
}
