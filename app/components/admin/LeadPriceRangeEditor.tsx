"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadDesiredPriceRangeAction } from "@/lib/admin/lead-actions";

type LeadPriceRangeEditorProps = {
  leadId: string;
  initialDesiredPriceRange: string | null;
};

/**
 * Edição manual da faixa de valor pretendida no detalhe do lead.
 */
export function LeadPriceRangeEditor({
  leadId,
  initialDesiredPriceRange,
}: LeadPriceRangeEditorProps) {
  const [value, setValue] = useState(initialDesiredPriceRange ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateLeadDesiredPriceRangeAction(
        leadId,
        value.trim() || null
      );
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error ?? "Erro ao salvar");
      }
    });
  };

  return (
    <div>
      <label
        htmlFor="lead-price-range"
        className="sr-only"
      >
        Faixa de valor
      </label>
      <input
        id="lead-price-range"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isPending}
        placeholder="Ex.: R$ 500 mil a R$ 800 mil ou valor livre"
        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="mt-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
      >
        {isPending ? "Salvando…" : "Salvar faixa de valor"}
      </button>
    </div>
  );
}
