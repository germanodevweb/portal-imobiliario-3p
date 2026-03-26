"use server";

import { redirect } from "next/navigation";

const WHATSAPP_NUMBER = "5511999999999";

const ASSUNTO_LABELS: Record<string, string> = {
  "comprar-imovel": "Comprar imóvel",
  "vender-imovel": "Vender imóvel",
  parceria: "Parceria",
  "reuniao-online": "Marcar uma reunião online",
  outros: "Outros",
};

export async function submitContatoAction(formData: FormData) {
  const nome = (formData.get("nome") as string)?.trim() ?? "";
  const telefone = (formData.get("telefone") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const assunto = (formData.get("assunto") as string) ?? "";
  const mensagem = (formData.get("mensagem") as string)?.trim() ?? "";

  const assuntoLabel = ASSUNTO_LABELS[assunto] ?? assunto;
  const text = [
    `Olá, 3Pinheiros!`,
    ``,
    `Nome: ${nome}`,
    `Telefone: ${telefone}`,
    `E-mail: ${email}`,
    `Assunto: ${assuntoLabel}`,
    ``,
    `Mensagem:`,
    mensagem,
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  redirect(url);
}
