// A lista de marcas vive em storeLogos.json (não .ts) para que
// scripts/prerender-seo.mjs — um script Node puro, fora do build do
// Vite/TypeScript — possa ler exatamente os mesmos dados sem duplicar a
// lista à mão. Qualquer logo adicionado aqui já vale também para a imagem
// de compartilhamento (og:image) do estabelecimento, sem editar dois
// lugares.
import storeLogos from "./storeLogos.json";

type StoreLogoEntry = { aliases: readonly string[]; local?: string; file?: string; tight?: boolean };

const STORE_LOGO_BASE_URL = storeLogos.baseUrl;
const STORE_LOGO_VERSION = storeLogos.version;
const STORE_LOGOS = storeLogos.entries as readonly StoreLogoEntry[];

const normalizeStoreName = (name: string) => name
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

function findStoreLogo(name: string) {
  const normalizedName = normalizeStoreName(name);
  return STORE_LOGOS.find(({ aliases }) =>
    aliases.some(alias => normalizedName === alias || normalizedName.includes(alias)),
  );
}

export function getStoreLogoUrl(name: string): string | undefined {
  const match = findStoreLogo(name);
  if (!match) return undefined;
  if (match.local) return match.local;
  return `${STORE_LOGO_BASE_URL}/${match.file}?v=${STORE_LOGO_VERSION}`;
}

export function isStoreLogoTightCrop(name: string): boolean {
  const match = findStoreLogo(name);
  return Boolean(match?.tight);
}
