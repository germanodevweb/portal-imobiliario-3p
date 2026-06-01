"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasBuilderContactColumns } from "@/lib/admin/schema-migration";
import {
  formatBuilderDisplayName,
  normalizeBuilderKey,
  slugifyBuilder,
} from "@/lib/utils/builder-normalize";

export type BuilderFormState = {
  errors?: Record<string, string>;
};

type ParsedBuilderContact = {
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  errors: Record<string, string>;
};

function parseBuilderContactForm(formData: FormData): ParsedBuilderContact {
  const errors: Record<string, string> = {};
  const contactName = (formData.get("contactName") as string)?.trim() ?? "";
  const contactPhone = (formData.get("contactPhone") as string)?.trim() ?? "";
  const contactEmailRaw = (formData.get("contactEmail") as string)?.trim() ?? "";
  const contactEmail = contactEmailRaw.length > 0 ? contactEmailRaw : null;

  if (!contactName) {
    errors.contactName = "Nome do responsável é obrigatório";
  }
  if (!contactPhone) {
    errors.contactPhone = "Telefone / WhatsApp é obrigatório";
  }
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    errors.contactEmail = "E-mail inválido";
  }

  return { contactName, contactPhone, contactEmail, errors };
}

async function assertNoDuplicateBuilder(
  normalizedKey: string,
  excludeId?: string
): Promise<string | null> {
  const existing = await prisma.builder.findUnique({
    where: { normalizedKey },
    select: { id: true, name: true },
  });

  if (existing && existing.id !== excludeId) {
    return `Já existe a construtora "${existing.name}" (mesma chave normalizada).`;
  }

  return null;
}

export async function createBuilderAction(
  _prevState: BuilderFormState,
  formData: FormData
): Promise<BuilderFormState> {
  const nameRaw = (formData.get("name") as string)?.trim() ?? "";
  const contact = parseBuilderContactForm(formData);
  const errors: Record<string, string> = { ...contact.errors };

  if (!nameRaw) {
    errors.name = "Nome da construtora é obrigatório";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const includeContact = await hasBuilderContactColumns();
  if (!includeContact) {
    return {
      errors: {
        _form:
          "Migration de contato da construtora pendente. Execute o SQL de contato no Supabase e reinicie o servidor.",
      },
    };
  }

  const name = formatBuilderDisplayName(nameRaw);
  const normalizedKey = normalizeBuilderKey(name);

  if (!normalizedKey) {
    return { errors: { name: "Nome da construtora inválido" } };
  }

  const duplicateError = await assertNoDuplicateBuilder(normalizedKey);
  if (duplicateError) {
    return { errors: { name: duplicateError } };
  }

  const slug = slugifyBuilder(name);

  await prisma.builder.create({
    data: {
      name,
      normalizedKey,
      slug,
      contactName: contact.contactName,
      contactPhone: contact.contactPhone,
      contactEmail: contact.contactEmail,
    },
  });

  revalidatePath("/admin/construtoras");
  redirect("/admin/construtoras");
}

export async function updateBuilderAction(
  _prevState: BuilderFormState,
  formData: FormData
): Promise<BuilderFormState> {
  const id = (formData.get("id") as string)?.trim() ?? "";
  const nameRaw = (formData.get("name") as string)?.trim() ?? "";
  const contact = parseBuilderContactForm(formData);
  const errors: Record<string, string> = { ...contact.errors };

  if (!id) {
    return { errors: { _form: "ID da construtora não informado" } };
  }
  if (!nameRaw) {
    errors.name = "Nome da construtora é obrigatório";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const includeContact = await hasBuilderContactColumns();
  if (!includeContact) {
    return {
      errors: {
        _form:
          "Migration de contato da construtora pendente. Execute o SQL de contato no Supabase e reinicie o servidor.",
      },
    };
  }

  const existing = await prisma.builder.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!existing) {
    return { errors: { _form: "Construtora não encontrada" } };
  }

  const name = formatBuilderDisplayName(nameRaw);
  const normalizedKey = normalizeBuilderKey(name);

  if (!normalizedKey) {
    return { errors: { name: "Nome da construtora inválido" } };
  }

  const duplicateError = await assertNoDuplicateBuilder(normalizedKey, id);
  if (duplicateError) {
    return { errors: { name: duplicateError } };
  }

  await prisma.$transaction([
    prisma.builder.update({
      where: { id },
      data: {
        name,
        normalizedKey,
        contactName: contact.contactName,
        contactPhone: contact.contactPhone,
        contactEmail: contact.contactEmail,
      },
    }),
    prisma.property.updateMany({
      where: { builderSlug: existing.slug },
      data: { builderName: name },
    }),
  ]);

  revalidatePath("/admin/construtoras");
  revalidatePath("/admin/imoveis");
  redirect("/admin/construtoras");
}

export async function deleteBuilderAction(id: string): Promise<{ error?: string }> {
  const trimmedId = id.trim();
  if (!trimmedId) {
    return { error: "ID inválido" };
  }

  const existing = await prisma.builder.findUnique({
    where: { id: trimmedId },
    select: { slug: true },
  });

  if (!existing) {
    return { error: "Construtora não encontrada" };
  }

  const propertyCount = await prisma.property.count({
    where: { builderSlug: existing.slug },
  });

  if (propertyCount > 0) {
    return {
      error: `Não é possível excluir: ${propertyCount} imóvel(is) usam esta construtora.`,
    };
  }

  await prisma.builder.delete({ where: { id: trimmedId } });

  revalidatePath("/admin/construtoras");
  return {};
}
