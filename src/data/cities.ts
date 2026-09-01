/**
 * Cidades atendidas pelo Preço Certo.
 *
 * O catálogo do banco guarda o bairro de cada estabelecimento (`neighborhood`).
 * Como não há coluna de cidade, o município é resolvido a partir do bairro:
 * bairros conhecidos são mapeados abaixo e o restante fica na cidade-sede.
 * Assim, tudo o que é cadastrado no painel admin aparece automaticamente na
 * página da cidade correspondente.
 */

export type CityDefinition = {
  slug: string;
  name: string;
  state: string;
  headline: string;
  description: string;
  /** Bairros/distritos que pertencem a esta cidade. */
  neighborhoods: string[];
};

export const citySlug = (value: string | null | undefined) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const cities: CityDefinition[] = [
  {
    slug: "feijo",
    name: "Feijó",
    state: "AC",
    headline: "Preços comparados em Feijó",
    description:
      "Todos os estabelecimentos cadastrados em Feijó, com preços por loja, promoções ativas e a comparação de quem está mais barato hoje.",
    neighborhoods: [
      "Centro",
      "Esperança",
      "Zenaide Paiva",
      "Conquista",
      "Bela Vista",
      "Boa União",
      "Cascata",
      "João Alves",
      "Miritizal",
      "Vitória",
    ],
  },
  {
    slug: "manoel-urbano",
    name: "Manoel Urbano",
    state: "AC",
    headline: "Preços comparados em Manoel Urbano",
    description:
      "Comércios de Manoel Urbano cadastrados na plataforma, com preços por loja e promoções publicadas pela administração.",
    neighborhoods: ["Manoel Urbano", "Vila Manoel Urbano"],
  },
  {
    slug: "tarauaca",
    name: "Tarauacá",
    state: "AC",
    headline: "Preços comparados em Tarauacá",
    description:
      "Estabelecimentos de Tarauacá com preços monitorados, ofertas e comparação item a item.",
    neighborhoods: ["Tarauacá", "Centro Tarauacá"],
  },
];

/** Cidade-sede: recebe todo bairro sem mapeamento explícito. */
export const defaultCity = cities[0];

const neighborhoodIndex = new Map<string, CityDefinition>();
for (const city of cities) {
  for (const neighborhood of city.neighborhoods) {
    neighborhoodIndex.set(citySlug(neighborhood), city);
  }
}

export function cityForNeighborhood(neighborhood: string | null | undefined): CityDefinition {
  const key = citySlug(neighborhood);
  if (!key) return defaultCity;
  return neighborhoodIndex.get(key) || defaultCity;
}

export function findCity(slug: string | null | undefined): CityDefinition | null {
  const key = citySlug(slug);
  return cities.find(city => city.slug === key) || null;
}

export function cityLabel(city: CityDefinition) {
  return `${city.name} — ${city.state}`;
}
