"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type CreateLeadState = {
  errors?: Record<string, string>;
};

const VALID_PRICE_RANGES = [
  "Até R$ 300 mil",
  "R$ 300 mil a R$ 500 mil",
  "R$ 500 mil a R$ 800 mil",
  "R$ 800 mil a R$ 1,5 milhão",
  "Acima de R$ 1,5 milhão",
] as const;

const VALID_MANUAL_SOURCES = ["instagram", "indicacao"] as const;

// ---------------------------------------------------------------------------
// Server Action: criar lead manual
// ---------------------------------------------------------------------------

export async function createLeadAction(
  _prevState: CreateLeadState,
  formData: FormData
): Promise<CreateLeadState> {
  const errors: Record<string, string> = {};

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const desiredPriceRange = (formData.get("desiredPriceRange") as string)?.trim();
  const manualSource = (formData.get("manualSource") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name) errors.name = "Nome é obrigatório";
  if (!phone) errors.phone = "Telefone é obrigatório";
  if (!manualSource) errors.manualSource = "Origem (manual) é obrigatória";
  if (!desiredPriceRange) {
    errors.desiredPriceRange = "Faixa de valor é obrigatória";
  } else if (
    !VALID_PRICE_RANGES.includes(desiredPriceRange as (typeof VALID_PRICE_RANGES)[number])
  ) {
    errors.desiredPriceRange = "Faixa de valor inválida";
  }
  if (
    manualSource &&
    !VALID_MANUAL_SOURCES.includes(manualSource as (typeof VALID_MANUAL_SOURCES)[number])
  ) {
    errors.manualSource = "Origem manual inválida";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await prisma.lead.create({
    data: {
      name,
      phone,
      desiredPriceRange,
      notes,
      origin: "manual",
      manualSource: manualSource || null,
      status: "novo",
    },
  });

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

// ---------------------------------------------------------------------------
// Server Action: atualizar status do lead
// ---------------------------------------------------------------------------

const VALID_STATUSES = [
  "novo",
  "em_contato",
  "qualificado",
  "vendido",
  "perdido",
] as const;

export async function updateLeadStatusAction(
  leadId: string,
  status: (typeof VALID_STATUSES)[number]
): Promise<{ ok: boolean; error?: string }> {
  if (!leadId || !status) {
    return { ok: false, error: "Dados inválidos" };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { ok: false, error: "Status inválido" };
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true };
  } catch (e) {
    console.error("[updateLeadStatusAction]", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar status",
    };
  }
}

// ---------------------------------------------------------------------------
// Server Action: atualizar anotações do lead
// ---------------------------------------------------------------------------

export async function updateLeadNotesAction(
  leadId: string,
  notes: string | null
): Promise<{ ok: boolean; error?: string }> {
  if (!leadId) {
    return { ok: false, error: "Lead inválido" };
  }

  const notesValue = typeof notes === "string" ? notes.trim() || null : null;

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { notes: notesValue },
    });
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true };
  } catch (e) {
    console.error("[updateLeadNotesAction]", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar anotações",
    };
  }
}
