"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatCityDisplayName,
  normalizeCityKey,
  parseCityInput,
  resolveCanonicalState,
  slugifyCity,
} from "@/lib/utils/city-normalize";

export type CityFormState = {
  errors?: Record<string, string>;
};

function parseStateForm(formData: FormData): {
  state: string;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const stateMode = (formData.get("stateMode") as string)?.trim() ?? "list";
  const stateList = (formData.get("state") as string)?.trim() ?? "";
  const stateManual = (formData.get("stateManual") as string)?.trim() ?? "";
  const state = stateMode === "manual" ? stateManual : stateList;

  if (!state) errors.state = "Estado é obrigatório";

  return { state, errors };
}

async function assertNoDuplicateCity(
  normalizedKey: string,
  stateSlug: string,
  excludeId?: string
): Promise<string | null> {
  const existing = await prisma.city.findUnique({
    where: {
      normalizedKey_stateSlug: {
        normalizedKey,
        stateSlug,
      },
    },
    select: { id: true, name: true },
  });

  if (existing && existing.id !== excludeId) {
    return `Já existe a cidade "${existing.name}" neste estado (mesma chave normalizada).`;
  }

  return null;
}

export async function createCityAction(
  _prevState: CityFormState,
  formData: FormData
): Promise<CityFormState> {
  const nameRaw = (formData.get("name") as string)?.trim() ?? "";
  const { state: stateRaw, errors: stateErrors } = parseStateForm(formData);
  const errors: Record<string, string> = { ...stateErrors };

  if (!nameRaw) {
    errors.name = "Nome da cidade é obrigatório";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const { cityName, normalizedKey } = parseCityInput(nameRaw);
  const { state, stateSlug } = resolveCanonicalState(stateRaw);

  if (!cityName || !normalizedKey) {
    return { errors: { name: "Nome da cidade inválido" } };
  }
  if (!state || !stateSlug) {
    return { errors: { state: "Estado inválido" } };
  }

  const duplicateError = await assertNoDuplicateCity(normalizedKey, stateSlug);
  if (duplicateError) {
    return { errors: { name: duplicateError } };
  }

  const name = formatCityDisplayName(cityName);
  const slug = slugifyCity(name);

  await prisma.city.create({
    data: {
      name,
      normalizedKey: normalizeCityKey(name),
      slug,
      state,
      stateSlug,
    },
  });

  revalidatePath("/admin/cidades");
  redirect("/admin/cidades");
}

export async function updateCityAction(
  _prevState: CityFormState,
  formData: FormData
): Promise<CityFormState> {
  const id = (formData.get("id") as string)?.trim() ?? "";
  const nameRaw = (formData.get("name") as string)?.trim() ?? "";
  const { state: stateRaw, errors: stateErrors } = parseStateForm(formData);
  const errors: Record<string, string> = { ...stateErrors };

  if (!id) {
    return { errors: { _form: "ID da cidade não informado" } };
  }
  if (!nameRaw) {
    errors.name = "Nome da cidade é obrigatório";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const existing = await prisma.city.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      stateSlug: true,
    },
  });

  if (!existing) {
    return { errors: { _form: "Cidade não encontrada" } };
  }

  const { cityName, normalizedKey } = parseCityInput(nameRaw);
  const { state, stateSlug } = resolveCanonicalState(stateRaw);

  if (!cityName || !normalizedKey) {
    return { errors: { name: "Nome da cidade inválido" } };
  }
  if (!state || !stateSlug) {
    return { errors: { state: "Estado inválido" } };
  }

  const duplicateError = await assertNoDuplicateCity(normalizedKey, stateSlug, id);
  if (duplicateError) {
    return { errors: { name: duplicateError } };
  }

  const stateChanged = stateSlug !== existing.stateSlug;

  if (stateChanged) {
    const propertyCount = await prisma.property.count({
      where: {
        citySlug: existing.slug,
        stateSlug: existing.stateSlug,
      },
    });

    if (propertyCount > 0) {
      return {
        errors: {
          _form:
            "Não é possível alterar o estado de uma cidade com imóveis vinculados. Edite apenas o nome.",
        },
      };
    }
  }

  const name = formatCityDisplayName(cityName);

  await prisma.$transaction([
    prisma.city.update({
      where: { id },
      data: {
        name,
        normalizedKey: normalizeCityKey(name),
        state,
        stateSlug,
      },
    }),
    prisma.property.updateMany({
      where: {
        citySlug: existing.slug,
        stateSlug: existing.stateSlug,
      },
      data: {
        city: name,
        state,
        ...(stateChanged ? { stateSlug } : {}),
      },
    }),
    prisma.neighborhood.updateMany({
      where: {
        citySlug: existing.slug,
        stateSlug: existing.stateSlug,
      },
      data: {
        city: name,
        state,
        ...(stateChanged ? { stateSlug } : {}),
      },
    }),
  ]);

  revalidatePath("/admin/cidades");
  revalidatePath("/admin/imoveis");
  revalidatePath("/imoveis");
  redirect("/admin/cidades");
}

export async function deleteCityAction(id: string): Promise<{ error?: string }> {
  const trimmedId = id.trim();
  if (!trimmedId) {
    return { error: "ID inválido" };
  }

  const existing = await prisma.city.findUnique({
    where: { id: trimmedId },
    select: { slug: true, stateSlug: true },
  });

  if (!existing) {
    return { error: "Cidade não encontrada" };
  }

  const propertyCount = await prisma.property.count({
    where: {
      citySlug: existing.slug,
      stateSlug: existing.stateSlug,
    },
  });

  if (propertyCount > 0) {
    return {
      error: `Não é possível excluir: ${propertyCount} imóvel(is) usam esta cidade.`,
    };
  }

  await prisma.city.delete({ where: { id: trimmedId } });

  revalidatePath("/admin/cidades");
  return {};
}
