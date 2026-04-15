"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLeadAction } from "@/lib/admin/lead-actions";

type Props = {
  leadId: string;
  leadName: string;
};

export function LeadDeleteButton({ leadId, leadName }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    const label = leadName.trim() || "este lead";
    if (
      !window.confirm(
        `Excluir permanentemente o lead "${label}"? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteLeadAction(leadId);
      if (result.ok) {
        router.refresh();
      } else {
        window.alert(result.error ?? "Não foi possível excluir o lead.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Excluir lead ${leadName.trim() || leadId}`}
      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Excluindo…" : "Excluir"}
    </button>
  );
}
