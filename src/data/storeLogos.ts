const STORE_LOGO_BASE_URL =
  "https://kqueiohjadwzxafdrrxk.supabase.co/storage/v1/object/public/products/establishments";
const STORE_LOGO_VERSION = "20260818-3";

const normalizeStoreName = (name: string) => name
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

/* `tight` marca logos cujo arquivo tem a marca desenhada pequena, centrada
 * num círculo com bastante margem transparente ao redor (crachá/selo) — em
 * vez de preencher o quadrado do arquivo de ponta a ponta como a maioria.
 * Lado a lado com as outras no diretório de estabelecimentos, essas ficavam
 * nitidamente menores e "redondas" onde as demais são retangulares/
 * preenchidas. Sem poder editar o arquivo de origem, um zoom extra só
 * nessas (ver .ref-store-card__select>i>img.ref-store-logo--tight) aproxima
 * o peso visual das outras, que já preenchem o quadro. */
const STORE_LOGOS = [
  { aliases: ["kelly burgueria e lanchonete", "kelly burgueria", "kelly burgueria lanchonete", "kelly"], local: "/branding/kelly-burgueria-logo.jpg?v=20260822", tight: true },
  { aliases: ["ponto do sanduba", "ponto do sanduba hamburgueria", "sanduba"], local: "/branding/ponto-do-sanduba-logo.jpg?v=20260822" },
  { aliases: ["comercio bons amigos", "bons amigos", "comercio ba bons amigos", "ba comercio bons amigos"], local: "/branding/bons-amigos-logo.svg?v=20260818-3", tight: true },
  { aliases: ["panificadora bandeira", "padaria bandeira", "bandeira"], local: "/branding/panificadora-bandeira.svg?v=20260818-3", tight: true },
  { aliases: ["drogaria pague pouco", "pague pouco"], file: "drogaria-pague-pouco.webp" },
  { aliases: ["doceria doce dia", "doce dia"], file: "doce-dia.webp" },
  { aliases: ["central super"], file: "central-super.webp" },
  { aliases: ["comercial maia", "e s maia"], file: "comercial-maia/logo.png" },
  { aliases: ["comercial vanderley", "comercial vandereley"], file: "comercial-vanderley.webp" },
  { aliases: ["drogarias ultra popular", "drogaria ultra popular", "ultra popular"], file: "drogaria-ultra-popular.webp" },
  { aliases: ["recanto da carne"], file: "recanto-da-carne.webp", tight: true },
  { aliases: ["supermercado 100 feijoense", "100 feijoense", "supermercado 100"], file: "100-por-cento.webp" },
  { aliases: ["comercial claudia", "comercial claudia feijo"], file: "comercial-claudia.webp" },
  { aliases: ["facem comercio f m araujo", "facem comercio", "facem"], file: "facem-comercio.webp" },
  { aliases: ["mercantil reboucas"], file: "mercantil-reboucas.webp" },
  { aliases: ["comercial parceirao", "parceirao"], file: "parceirao.webp" },
  { aliases: ["varejao contamigos", "contamigos"], file: "varejao-contamigos.webp" },
] as const;

function findStoreLogo(name: string) {
  const normalizedName = normalizeStoreName(name);
  return STORE_LOGOS.find(({ aliases }) =>
    aliases.some(alias => normalizedName === alias || normalizedName.includes(alias)),
  );
}

export function getStoreLogoUrl(name: string): string | undefined {
  const match = findStoreLogo(name);
  if (!match) return undefined;
  if ("local" in match) return match.local;
  return `${STORE_LOGO_BASE_URL}/${match.file}?v=${STORE_LOGO_VERSION}`;
}

export function isStoreLogoTightCrop(name: string): boolean {
  const match = findStoreLogo(name);
  return Boolean(match && "tight" in match && match.tight);
}
