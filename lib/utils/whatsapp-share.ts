/**
 * Abre o WhatsApp com texto pré-preenchido (utilizador escolhe o contacto).
 * Documentação: https://faq.whatsapp.com/general/chats/how-to-use-click-to-chat
 */
export function buildWhatsAppShareUrl(text: string): string {
  const url = new URL("https://api.whatsapp.com/send");
  url.searchParams.set("text", text);
  return url.toString();
}
