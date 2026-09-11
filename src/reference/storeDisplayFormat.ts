// Normalização de texto exibido no perfil do estabelecimento: o cadastro
// guarda nomes e categorias como o lojista/importação digitou (caixa alta,
// código de banco com underscore, medida solta) e a tela deve mostrar algo
// legível sem reescrever o dado de origem.

const CONNECTORS = new Set(["de", "da", "do", "das", "dos", "e", "em", "com", "a", "o", "para"]);

// Palavras do domínio de mercearia/farmácia cujo acento a normalização por
// maiúscula/minúscula sozinha não devolve (ex.: "PO" -> "Po", nunca "Pó").
const ACCENT_FIXES: Record<string, string> = {
  po: "pó", pos: "pós", acougue: "açougue", acougues: "açougues",
  higiene: "higiene", laticinios: "laticínios", basicos: "básicos",
  organicos: "orgânicos", congelados: "congelados", refrigerantes: "refrigerantes",
  alcoolicas: "alcoólicas", nao: "não", alcoolico: "alcoólico",
  acucar: "açúcar", acucares: "açúcares", biscoitos: "biscoitos",
  graos: "grãos", oleos: "óleos", cafes: "cafés", cafe: "café",
  chas: "chás", limpeza: "limpeza", padaria: "padaria", pereciveis: "perecíveis",
  mercearia: "mercearia", bebe: "bebê", eletronicos: "eletrônicos",
};

function capitalizeWord(word: string, isFirst: boolean) {
  const lower = word.toLocaleLowerCase("pt-BR");
  const fixed = ACCENT_FIXES[lower] || lower;
  if (!isFirst && CONNECTORS.has(fixed)) return fixed;
  return fixed.charAt(0).toLocaleUpperCase("pt-BR") + fixed.slice(1);
}

/** "bebidas_em_po" / "BEBIDAS_EM_PO" -> "Bebidas em Pó" */
export function humanizeCategory(value?: string | null): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  const words = raw.replace(/[_-]+/g, " ").split(/\s+/).filter(Boolean);
  return words.map((word, index) => capitalizeWord(word, index === 0)).join(" ");
}

function isShouting(value: string) {
  const letters = value.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length < 3) return false;
  return letters === letters.toLocaleUpperCase("pt-BR") && letters !== letters.toLocaleLowerCase("pt-BR");
}

/** Só reformata quando o texto está gritando em caixa alta; nomes próprios
 * com caixa mista ("Recanto da Carne") permanecem exatamente como cadastrados. */
export function properCaseIfShouting(value?: string | null): string {
  const raw = (value || "").trim();
  if (!raw || !isShouting(raw)) return raw;
  return raw.split(/(\s+)/).map(chunk => {
    if (/^\s+$/.test(chunk)) return chunk;
    return chunk.split("-").map((part, index) => capitalizeWord(part, index === 0)).join("-");
  }).join("").replace(/^./, first => first.toLocaleUpperCase("pt-BR"));
}

const UNIT_LABELS: Record<string, string> = {
  un: "unidade", und: "unidade", unid: "unidade", pct: "pacote",
  cx: "caixa", fr: "frasco", kg: "kg", g: "g", l: "l", ml: "ml",
  dz: "dúzia", par: "par",
};

/** Uma medida solta ("240", "un") não diz nada sozinha; combinada fica
 * "240 g" / "1 unidade". Quando o tamanho já traz a unidade embutida
 * ("500ml"), mostra só o tamanho. */
export function formatProductSpec(size?: string | null, unit?: string | null): string {
  const cleanSize = (size && !/^[-–—\s]*$/.test(size)) ? size.trim() : "";
  const cleanUnit = (unit || "").trim();
  if (cleanSize && /[a-zA-Z]/.test(cleanSize)) return cleanSize;
  const unitLabel = UNIT_LABELS[cleanUnit.toLocaleLowerCase("pt-BR")] || cleanUnit;
  if (cleanSize && unitLabel) return `${cleanSize} ${unitLabel}`;
  if (cleanSize) return cleanSize;
  if (unitLabel) return unitLabel;
  return "Unidade não informada";
}

/** Mesma regra usada no diretório de estabelecimentos (ReferenceExperience):
 * DDD + número já viram "55<ddd><numero>"; números maiores presume-se que já
 * incluem o código do país. */
export function whatsappHref(rawPhone: string, message?: string) {
  const digits = rawPhone.replace(/\D/g, "");
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${withCountry}${text}`;
}
