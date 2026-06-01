"use client";

import {
  type FormEvent,
  startTransition,
  useActionState,
} from "react";
import Link from "next/link";
import {
  createBuilderAction,
  updateBuilderAction,
  type BuilderFormState,
} from "@/lib/admin/builder-actions";

type EditInitialData = {
  id: string;
  name: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

type Props = {
  mode: "create" | "edit";
  initialData?: EditInitialData;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export function AdminBuilderForm({ mode, initialData }: Props) {
  const action = mode === "create" ? createBuilderAction : updateBuilderAction;
  const [state, formAction, pending] = useActionState<BuilderFormState, FormData>(
    action,
    {}
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  const errors = state.errors ?? {};

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl space-y-5 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
    >
      {mode === "edit" && initialData ? (
        <input type="hidden" name="id" value={initialData.id} />
      ) : null}

      {errors._form ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors._form}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
          Nome da construtora *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialData?.name ?? ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          placeholder="Ex.: Moura Dubeux"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Variações como moura dubeux ou MOURA DUBEUX serão reconhecidas como a mesma
          construtora.
        </p>
        <FieldError message={errors.name} />
      </div>

      <div>
        <label htmlFor="contactName" className="block text-sm font-medium text-zinc-700">
          Nome do responsável *
        </label>
        <input
          id="contactName"
          name="contactName"
          type="text"
          required
          defaultValue={initialData?.contactName ?? ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          placeholder="Ex.: Thiago"
        />
        <FieldError message={errors.contactName} />
      </div>

      <div>
        <label htmlFor="contactPhone" className="block text-sm font-medium text-zinc-700">
          Telefone / WhatsApp *
        </label>
        <input
          id="contactPhone"
          name="contactPhone"
          type="tel"
          required
          defaultValue={initialData?.contactPhone ?? ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          placeholder="(85) 99999-9999"
        />
        <FieldError message={errors.contactPhone} />
      </div>

      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium text-zinc-700">
          E-mail (opcional)
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={initialData?.contactEmail ?? ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          placeholder="contato@construtora.com.br"
        />
        <FieldError message={errors.contactEmail} />
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/construtoras"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {pending
            ? "Salvando…"
            : mode === "create"
              ? "Cadastrar construtora"
              : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
