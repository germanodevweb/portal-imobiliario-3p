"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  buildWhatsAppChatHref,
  CONTATO_ASSUNTO_LABELS,
  CONTATO_ASSUNTO_VALUES,
  type ContatoAssuntoValue,
} from "@/lib/constants/contato";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type SubmitContatoState = {
  success?: boolean;
  errors?: Record<string, string>;
};

const MIN_PHONE_DIGITS = 8;
const MAX_MESSAGE_LENGTH = 8000;
const MIN_NAME_LENGTH = 2;
const MIN_MESSAGE_LENGTH = 3;

const ASSUNTO_SET = new Set<string>([...CONTATO_ASSUNTO_VALUES]);

function isContatoAssunto(value: string): value is ContatoAssuntoValue {
  return ASSUNTO_SET.has(value);
}

function isValidEmail(email: string): boolean {
  if (email.length === 0 || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildContatoNotes(params: {
  email: string;
  assuntoLabel: string;
  mensagem: string;
}): string {
  return [
    "Lead — formulário de contato (site)",
    "",
    `E-mail: ${params.email}`,
    `Assunto: ${params.assuntoLabel}`,
    "",
    "Mensagem:",
    params.mensagem,
  ].join("\n");
}

function buildWhatsAppText(params: {
  nome: string;
  telefone: string;
  email: string;
  assuntoLabel: string;
  mensagem: string;
}): string {
  return [
    "Olá, 3Pinheiros!",
    "",
    `Nome: ${params.nome}`,
    `Telefone: ${params.telefone}`,
    `E-mail: ${params.email}`,
    `Assunto: ${params.assuntoLabel}`,
    "",
    "Mensagem:",
    params.mensagem,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Server Action — persiste Lead (origin site) e redireciona ao WhatsApp
// ---------------------------------------------------------------------------

export async function submitContatoAction(
  _prevState: SubmitContatoState,
  formData: FormData
): Promise<SubmitContatoState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const assuntoRaw = String(formData.get("assunto") ?? "");
  const mensagem = String(formData.get("mensagem") ?? "").trim();

  const errors: Record<string, string> = {};

  if (nome.length < MIN_NAME_LENGTH) {
    errors.nome = "Informe seu nome completo";
  }

  const phoneDigits = telefone.replace(/\D/g, "");
  if (phoneDigits.length < MIN_PHONE_DIGITS) {
    errors.telefone = "Informe um telefone válido (DDD + número)";
  }

  if (!email) {
    errors.email = "E-mail é obrigatório";
  } else if (!isValidEmail(email)) {
    errors.email = "E-mail inválido";
  }

  if (!isContatoAssunto(assuntoRaw)) {
    errors.assunto = "Selecione um assunto";
  }

  if (!mensagem) {
    errors.mensagem = "Mensagem é obrigatória";
  } else if (mensagem.length < MIN_MESSAGE_LENGTH) {
    errors.mensagem = "Mensagem muito curta";
  } else if (mensagem.length > MAX_MESSAGE_LENGTH) {
    errors.mensagem = "Mensagem excede o limite permitido";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  if (!isContatoAssunto(assuntoRaw)) {
    return { errors: { assunto: "Selecione um assunto" } };
  }

  const assuntoLabel = CONTATO_ASSUNTO_LABELS[assuntoRaw];
  const notes = buildContatoNotes({
    email,
    assuntoLabel,
    mensagem,
  });

  try {
    await prisma.lead.create({
      data: {
        name: nome,
        phone: telefone,
        desiredPriceRange: null,
        origin: "site",
        status: "novo",
        notes,
      },
    });
  } catch {
    return {
      errors: {
        _form:
          "Não foi possível enviar sua mensagem agora. Tente novamente em instantes.",
      },
    };
  }

  revalidatePath("/admin/leads");

  const text = buildWhatsAppText({
    nome,
    telefone,
    email,
    assuntoLabel,
    mensagem,
  });
  redirect(buildWhatsAppChatHref(text));
}
