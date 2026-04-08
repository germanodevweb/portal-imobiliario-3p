/**
 * Abre o WhatsApp com texto pré-preenchido (utilizador escolhe o contacto).
 * Documentação: https://faq.whatsapp.com/general/chats/how-to-use-click-to-chat
 */
export function buildWhatsAppShareUrl(text: string): string {
  // encodeURIComponent usa %20 para espaços; URLSearchParams usa "+" e o WhatsApp pode truncar a mensagem.
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
