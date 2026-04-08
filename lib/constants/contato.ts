/** URL do WhatsApp Business (atalho por código). O WhatsApp costuma ignorar `?text=` neste formato. */
export const WHATSAPP_CONTACT_URL =
  "https://wa.me/message/L3QZKLL6LEAJO1" as const;

/** Texto pré-preenchido ao abrir o WhatsApp pelos CTAs do site (botão flutuante, rodapé, etc.). */
export const WHATSAPP_DEFAULT_INTRO_MESSAGE =
  "Olá, estou vindo do site da 3 Pinheiros Consultoria Imobiliária! Você pode me ajudar?";

const MIN_WHATSAPP_PHONE_DIGITS = 10;

/**
 * Número do WhatsApp em formato internacional, só dígitos (ex.: Brasil `5585987654321`).
 * O parâmetro `?text=` só preenche a mensagem de forma fiável com `https://wa.me/<número>?text=...`,
 * não com links `wa.me/message/...`.
 */
function whatsAppPhoneDigitsFromEnv(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.trim();
  const digits = raw?.replace(/\D/g, "") ?? "";
  return digits.length >= MIN_WHATSAPP_PHONE_DIGITS ? digits : undefined;
}

/**
 * Abre o chat com texto pré-preenchido quando `NEXT_PUBLIC_WHATSAPP_PHONE` está definido.
 * Usa `https://api.whatsapp.com/send?phone=&text=` (FAQ “Clicar para conversar” do WhatsApp),
 * que costuma respeitar `text` melhor que `wa.me/<número>?text=` em Android / WhatsApp Business.
 */
export function buildWhatsAppChatHref(text: string): string {
  const phone = whatsAppPhoneDigitsFromEnv();
  if (phone) {
    // Não usar URLSearchParams: serializa espaços como "+" e o WhatsApp (Android) costuma cortar o texto no primeiro "+".
    const q = text.trim()
      ? `phone=${phone}&text=${encodeURIComponent(text)}`
      : `phone=${phone}`;
    return `https://api.whatsapp.com/send?${q}`;
  }
  return WHATSAPP_CONTACT_URL;
}

/** `href` para CTAs com a mensagem de introdução padrão do site. */
export function getWhatsAppContactHref(
  text: string = WHATSAPP_DEFAULT_INTRO_MESSAGE
): string {
  return buildWhatsAppChatHref(text);
}

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
