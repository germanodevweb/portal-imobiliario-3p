"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatNeighborhoodDisplayName,
  normalizeNeighborhoodKey,
  slugifyNeighborhood,
} from "@/lib/utils/neighborhood-normalize";

export type NeighborhoodFormState = {
  errors?: Record<string, string>;
};

function parseCityState(formData: FormData): {
  city: string;
  state: string;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const cityMode = (formData.get("cityMode") as string)?.trim() ?? "list";
  const cityList = (formData.get("city") as string)?.trim() ?? "";
  const cityManual = (formData.get("cityManual") as string)?.trim() ?? "";
  const city = cityMode === "manual" ? cityManual : cityList;

  const stateMode = (formData.get("stateMode") as string)?.trim() ?? "list";
  const stateList = (formData.get("state") as string)?.trim() ?? "";
  const stateManual = (formData.get("stateManual") as string)?.trim() ?? "";
  const state = stateMode === "manual" ? stateManual : stateList;

  if (!city) errors.city = "Cidade é obrigatória";
  if (!state) errors.state = "Estado é obrigatório";

  return { city, state, errors };
}

async function assertNoDuplicateNeighborhood(
  normalizedKey: string,
  citySlug: string,
  stateSlug: string,
  excludeId?: string
): Promise<string | null> {
  const existing = await prisma.neighborhood.findUnique({
    where: {
      normalizedKey_citySlug_stateSlug: {
        normalizedKey,
        citySlug,
        stateSlug,
      },
    },
    select: { id: true, name: true },
  });

  if (existing && existing.id !== excludeId) {
    return `Já existe o bairro "${existing.name}" nesta cidade/estado (mesma chave normalizada).`;
  }

  return null;
}

export async function createNeighborhoodAction(
  _prevState: NeighborhoodFormState,
  formData: FormData
): Promise<NeighborhoodFormState> {
  const nameRaw = (formData.get("name") as string)?.trim() ?? "";
  const { city, state, errors: locationErrors } = parseCityState(formData);
  const errors: Record<string, string> = { ...locationErrors };

  if (!nameRaw) {
    errors.name = "Nome do bairro é obrigatório";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const name = formatNeighborhoodDisplayName(nameRaw);
  const normalizedKey = normalizeNeighborhoodKey(name);
  const citySlug = slugifyNeighborhood(city);
  const stateSlug = slugifyNeighborhood(state);

  if (!normalizedKey) {
    return { errors: { name: "Nome do bairro inválido" } };
  }

  const duplicateError = await assertNoDuplicateNeighborhood(
    normalizedKey,
    citySlug,
    stateSlug
  );
  if (duplicateError) {
    return { errors: { name: duplicateError } };
  }

  const slug = slugifyNeighborhood(name);

  await prisma.neighborhood.create({
    data: {
      name,
      normalizedKey,
      slug,
      city,
      citySlug,
      state,
      stateSlug,
    },
  });

  revalidatePath("/admin/bairros");
  redirect("/admin/bairros");
}

export async function updateNeighborhoodAction(
  _prevState: NeighborhoodFormState,
  formData: FormData
): Promise<NeighborhoodFormState> {
  const id = (formData.get("id") as string)?.trim() ?? "";
  const nameRaw = (formData.get("name") as string)?.trim() ?? "";
  const { city, state, errors: locationErrors } = parseCityState(formData);
  const errors: Record<string, string> = { ...locationErrors };

  if (!id) {
    return { errors: { _form: "ID do bairro não informado" } };
  }
  if (!nameRaw) {
    errors.name = "Nome do bairro é obrigatório";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const existing = await prisma.neighborhood.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      citySlug: true,
      stateSlug: true,
    },
  });

  if (!existing) {
    return { errors: { _form: "Bairro não encontrado" } };
  }

  const name = formatNeighborhoodDisplayName(nameRaw);
  const normalizedKey = normalizeNeighborhoodKey(name);
  const citySlug = slugifyNeighborhood(city);
  const stateSlug = slugifyNeighborhood(state);

  if (!normalizedKey) {
    return { errors: { name: "Nome do bairro inválido" } };
  }

  const duplicateError = await assertNoDuplicateNeighborhood(
    normalizedKey,
    citySlug,
    stateSlug,
    id
  );
  if (duplicateError) {
    return { errors: { name: duplicateError } };
  }

  const cityOrStateChanged =
    citySlug !== existing.citySlug || stateSlug !== existing.stateSlug;

  if (cityOrStateChanged) {
    const propertyCount = await prisma.property.count({
      where: {
        neighborhoodSlug: existing.slug,
        citySlug: existing.citySlug,
        stateSlug: existing.stateSlug,
      },
    });

    if (propertyCount > 0) {
      return {
        errors: {
          _form:
            "Não é possível alterar cidade/estado de um bairro com imóveis vinculados. Edite apenas o nome.",
        },
      };
    }
  }

  await prisma.$transaction([
    prisma.neighborhood.update({
      where: { id },
      data: {
        name,
        normalizedKey,
        city,
        citySlug,
        state,
        stateSlug,
      },
    }),
    prisma.property.updateMany({
      where: {
        neighborhoodSlug: existing.slug,
        citySlug: existing.citySlug,
        stateSlug: existing.stateSlug,
      },
      data: {
        neighborhood: name,
        ...(cityOrStateChanged
          ? {
              city,
              citySlug,
              state,
              stateSlug,
            }
          : {}),
      },
    }),
  ]);

  revalidatePath("/admin/bairros");
  revalidatePath("/imoveis");
  redirect("/admin/bairros");
}

export async function deleteNeighborhoodAction(id: string): Promise<{ error?: string }> {
  const trimmedId = id.trim();
  if (!trimmedId) {
    return { error: "ID inválido" };
  }

  const existing = await prisma.neighborhood.findUnique({
    where: { id: trimmedId },
    select: { slug: true, citySlug: true, stateSlug: true },
  });

  if (!existing) {
    return { error: "Bairro não encontrado" };
  }

  const propertyCount = await prisma.property.count({
    where: {
      neighborhoodSlug: existing.slug,
      citySlug: existing.citySlug,
      stateSlug: existing.stateSlug,
    },
  });

  if (propertyCount > 0) {
    return {
      error: `Não é possível excluir: ${propertyCount} imóvel(is) usam este bairro.`,
    };
  }

  await prisma.neighborhood.delete({ where: { id: trimmedId } });

  revalidatePath("/admin/bairros");
  return {};
}
