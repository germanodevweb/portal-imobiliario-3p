"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatusAction } from "@/lib/admin/lead-actions";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
} from "@/lib/constants/leads";

type LeadStatus = keyof typeof LEAD_STATUS_LABELS;

type LeadStatusSelectProps = {
  leadId: string;
  currentStatus: LeadStatus;
};

/**
 * Select inline para edição de status do lead na listagem.
 * Cor visual automática via LEAD_STATUS_COLORS.
 */
export function LeadStatusSelect({ leadId, currentStatus }: LeadStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as LeadStatus;
    if (newStatus === currentStatus) return;

    startTransition(async () => {
      const result = await updateLeadStatusAction(leadId, newStatus);
      if (result.ok) {
        router.refresh();
      }
    });
  };

  const colorClasses = LEAD_STATUS_COLORS[currentStatus];

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`min-w-[120px] cursor-pointer rounded-full border-0 px-2.5 py-0.5 text-xs font-medium focus:ring-2 focus:ring-green-600/30 disabled:cursor-not-allowed disabled:opacity-60 ${colorClasses}`}
      aria-label={`Alterar status do lead (atual: ${LEAD_STATUS_LABELS[currentStatus]})`}
    >
      {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((status) => (
        <option key={status} value={status}>
          {LEAD_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
