// Único lugar para configurar o WhatsApp de vendas do PreçoCerto.
// Formato: código do país + DDD + número, sem espaços/símbolos. Ex.: "5568999999999".
export const WHATSAPP_SALES_NUMBER = "";

export function whatsappSalesLink(message: string) {
  const text = encodeURIComponent(message);
  return WHATSAPP_SALES_NUMBER ? `https://wa.me/${WHATSAPP_SALES_NUMBER}?text=${text}` : `https://wa.me/?text=${text}`;
}
