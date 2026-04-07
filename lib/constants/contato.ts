/** URL do WhatsApp Business usada no site (formulário de contato e CTAs). */
export const WHATSAPP_CONTACT_URL =
  "https://wa.me/message/5YEBRRXV7OACK1" as const;

export const CONTATO_ASSUNTO_VALUES = [
  "comprar-imovel",
  "vender-imovel",
  "parceria",
  "reuniao-online",
  "outros",
] as const;

export type ContatoAssuntoValue = (typeof CONTATO_ASSUNTO_VALUES)[number];

export const CONTATO_ASSUNTO_LABELS: Record<ContatoAssuntoValue, string> = {
  "comprar-imovel": "Comprar imóvel",
  "vender-imovel": "Vender imóvel",
  parceria: "Parceria",
  "reuniao-online": "Marcar uma reunião online",
  outros: "Outros",
};

export const CONTATO_ASSUNTO_OPTIONS: ReadonlyArray<{
  value: "" | ContatoAssuntoValue;
  label: string;
}> = [
  { value: "", label: "Escolha um assunto" },
  { value: "comprar-imovel", label: CONTATO_ASSUNTO_LABELS["comprar-imovel"] },
  { value: "vender-imovel", label: CONTATO_ASSUNTO_LABELS["vender-imovel"] },
  { value: "parceria", label: CONTATO_ASSUNTO_LABELS.parceria },
  { value: "reuniao-online", label: CONTATO_ASSUNTO_LABELS["reuniao-online"] },
  { value: "outros", label: CONTATO_ASSUNTO_LABELS.outros },
];
