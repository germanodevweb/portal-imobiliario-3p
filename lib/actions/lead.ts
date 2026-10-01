"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validateBrazilianWhatsappField } from "@/lib/utils/phone";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type SubmitLeadFromSiteState = {
  success?: boolean;
  errors?: Record<string, string>;
};

const VALID_PRICE_RANGES = [
  "Até R$ 300 mil",
  "R$ 300 mil a R$ 500 mil",
  "R$ 500 mil a R$ 800 mil",
  "R$ 800 mil a R$ 1,5 milhão",
  "Acima de R$ 1,5 milhão",
] as const;

// ---------------------------------------------------------------------------
// Server Action: captura de lead pelo site público
// origin = site, status = novo, notes = "Lead captado pelo site"
// ---------------------------------------------------------------------------

export async function submitLeadFromSiteAction(
  _prevState: SubmitLeadFromSiteState,
  formData: FormData
): Promise<SubmitLeadFromSiteState> {
  const errors: Record<string, string> = {};

  const name = (formData.get("name") as string)?.trim();
  const phoneRaw = (formData.get("phone") as string)?.trim();
  const desiredPriceRange = (formData.get("desiredPriceRange") as string)?.trim();

  if (!name) errors.name = "Nome é obrigatório";

  const phoneValidation = validateBrazilianWhatsappField(phoneRaw ?? "");
  if (!phoneValidation.ok) {
    errors.phone = phoneValidation.error;
  }

  if (!desiredPriceRange) {
    errors.desiredPriceRange = "Faixa de valor é obrigatória";
  } else if (
    !VALID_PRICE_RANGES.includes(
      desiredPriceRange as (typeof VALID_PRICE_RANGES)[number]
    )
  ) {
    errors.desiredPriceRange = "Faixa de valor inválida";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  if (!phoneValidation.ok) {
    return { errors: { phone: phoneValidation.error } };
  }

  await prisma.lead.create({
    data: {
      name,
      phone: phoneValidation.normalized,
      desiredPriceRange,
      notes: "Lead captado pelo site",
      origin: "site",
      status: "novo",
    },
  });

  revalidatePath("/admin/leads");
  return { success: true };
}

export type SubmitPropertyInterestLeadState = {
  success?: boolean;
  errors?: Record<string, string>;
};

/**
 * Captura de lead na página do imóvel (#interesse): nome + WhatsApp + contexto do imóvel.
 */
export async function submitPropertyInterestLeadAction(
  _prevState: SubmitPropertyInterestLeadState,
  formData: FormData
): Promise<SubmitPropertyInterestLeadState> {
  const errors: Record<string, string> = {};

  const name = (formData.get("name") as string)?.trim();
  const phoneRaw = (formData.get("phone") as string)?.trim();
  const propertyId = (formData.get("propertyId") as string)?.trim() || null;
  const propertySlug = (formData.get("propertySlug") as string)?.trim() || null;
  const sourcePath = (formData.get("sourcePath") as string)?.trim() || null;

  if (!name) errors.name = "Nome é obrigatório";

  const phoneValidation = validateBrazilianWhatsappField(phoneRaw ?? "");
  if (!phoneValidation.ok) {
    errors.phone = phoneValidation.error;
  }

  if (!propertyId && !propertySlug) {
    errors.form = "Contexto do imóvel inválido. Recarregue a página.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  if (!phoneValidation.ok) {
    return { errors: { phone: phoneValidation.error } };
  }

  if (propertyId) {
    const exists = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, slug: true },
    });
    if (!exists) {
      return { errors: { form: "Imóvel não encontrado." } };
    }
  }

  const slugForNotes = propertySlug ?? "—";
  await prisma.lead.create({
    data: {
      name,
      phone: phoneValidation.normalized,
      desiredPriceRange: null,
      notes: `Lead captado na página do imóvel: ${slugForNotes}`,
      origin: "site",
      status: "novo",
      propertyId,
      propertySlug,
      sourcePath,
    },
  });

  revalidatePath("/admin/leads");
  return { success: true };
}
