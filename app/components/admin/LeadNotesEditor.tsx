"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadNotesAction } from "@/lib/admin/lead-actions";

type LeadNotesEditorProps = {
  leadId: string;
  initialNotes: string | null;
};

/**
 * Editor de anotações do lead na página de detalhe.
 */
export function LeadNotesEditor({ leadId, initialNotes }: LeadNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateLeadNotesAction(
        leadId,
        notes.trim() || null
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
        htmlFor="lead-notes"
        className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
      >
        Anotações
      </label>
      <textarea
        id="lead-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={isPending}
        rows={4}
        placeholder="Anotações internas sobre o lead..."
        className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50"
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
        {isPending ? "Salvando…" : "Salvar anotações"}
      </button>
    </div>
  );
}
