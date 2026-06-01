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
