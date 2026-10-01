"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  submitPropertyInterestLeadAction,
  type SubmitPropertyInterestLeadState,
} from "@/lib/actions/lead";
import { trackGa4Event } from "@/lib/analytics/ga4-events";
import { WHATSAPP_PHONE_ERROR_MESSAGE, WHATSAPP_PHONE_EXAMPLE } from "@/lib/utils/phone";

const initialState: SubmitPropertyInterestLeadState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

type PropertyInterestFormProps = {
  propertyId: string;
  propertySlug: string;
  sourcePath: string;
};

export function PropertyInterestForm({
  propertyId,
  propertySlug,
  sourcePath,
}: PropertyInterestFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitPropertyInterestLeadAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.errors ?? {};

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
      trackGa4Event("generate_lead", { property_slug: propertySlug });
    }
  }, [state?.success, propertySlug]);

  if (state?.success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-green-200 bg-white p-4 text-center"
      >
        <p className="font-semibold text-green-800">Solicitação enviada!</p>
        <p className="mt-1 text-sm text-green-700">
          Em breve um consultor da 3Pinheiros entrará em contato pelo WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="propertySlug" value={propertySlug} />
      <input type="hidden" name="sourcePath" value={sourcePath} />

      {errors.form ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </p>
      ) : null}

      <div>
        <label htmlFor="property-interest-name" className="block text-sm font-medium text-zinc-800">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          id="property-interest-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          disabled={isPending}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
          placeholder="Seu nome"
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <label htmlFor="property-interest-phone" className="block text-sm font-medium text-zinc-800">
          WhatsApp <span className="text-red-500">*</span>
        </label>
        <input
          id="property-interest-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          maxLength={16}
          disabled={isPending}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
          placeholder={WHATSAPP_PHONE_EXAMPLE}
          title={WHATSAPP_PHONE_ERROR_MESSAGE}
        />
        <FieldError message={errors.phone} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-green-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
      >
        {isPending ? "Enviando…" : "Solicitar informações"}
      </button>
    </form>
  );
}
