/**
 * Semente de catálogo real do PreçoCerto.
 *
 * Por quê: as listas de categoria e as páginas de cidade ficam vazias enquanto
 * o banco não tem produto + preço por loja. Cada item abaixo corresponde a uma
 * FOTO REAL já existente em `src/assets/products/`, então o resolvedor de
 * imagens (`resolveProductImage`) encontra a foto pelo nome do produto — sem
 * placeholder e sem depender de URL externa.
 *
 * A gravação usa exatamente as mesmas RPCs administrativas do painel
 * (`admin_save_product` / `admin_set_product_price`), portanto respeita RLS e
 * o papel de admin: nada é inserido sem uma sessão administrativa válida.
 */
import { saveAdminProduct, setAdminProductPrice, invalidateAdminCatalog } from "./adminCatalog";

export interface SeedProduct {
  /** Nome exatamente igual ao arquivo da foto real (sem acento/extensão). */
  name: string;
  brand: string;
  category: string;
  size: string;
  unit: string;
  /** Preço de referência em Feijó/AC; cada loja recebe uma variação. */
  price: number;
}

export const seedCatalog: SeedProduct[] = [
  // Mercearia
  { name: "Feijão Carioca Bernardo 1kg", brand: "Bernardo", category: "Mercearia", size: "1 kg", unit: "pacote", price: 8.9 },
  { name: "Macarrão Espaguete Miragina 500g", brand: "Miragina", category: "Mercearia", size: "500 g", unit: "pacote", price: 4.5 },
  { name: "Massa para Lasanha Dona Benta 500g", brand: "Dona Benta", category: "Mercearia", size: "500 g", unit: "pacote", price: 9.9 },
  { name: "Macarrão Instantâneo Nissin Lámen Galinha 85g", brand: "Nissin", category: "Mercearia", size: "85 g", unit: "pacote", price: 2.5 },
  { name: "Macarrão Instantâneo Nissin Lámen Frango Assado com Limão 85g", brand: "Nissin", category: "Mercearia", size: "85 g", unit: "pacote", price: 2.5 },
  { name: "Cup Noodles Nissin Bolonhesa 70g", brand: "Nissin", category: "Mercearia", size: "70 g", unit: "copo", price: 6.9 },
  { name: "Cup Noodles Nissin Costela 70g", brand: "Nissin", category: "Mercearia", size: "70 g", unit: "copo", price: 6.9 },
  { name: "Cup Noodles Nissin Galinha Caipira Picante 70g", brand: "Nissin", category: "Mercearia", size: "70 g", unit: "copo", price: 6.9 },
  { name: "Vinagre de Álcool Castelo 750ml", brand: "Castelo", category: "Mercearia", size: "750 ml", unit: "garrafa", price: 5.5 },
  { name: "Vinagre de Álcool Toscano Aromas 750ml", brand: "Toscano", category: "Mercearia", size: "750 ml", unit: "garrafa", price: 5.2 },
  { name: "Vinagre de Maçã Toscano 750ml", brand: "Toscano", category: "Mercearia", size: "750 ml", unit: "garrafa", price: 7.9 },
  { name: "Milho Verde em Conserva Olé 200g", brand: "Olé", category: "Mercearia", size: "200 g", unit: "lata", price: 3.9 },
  { name: "Seleta de Legumes em Conserva Olé 200g", brand: "Olé", category: "Mercearia", size: "200 g", unit: "lata", price: 4.3 },
  { name: "Leite de Coco Bom Coco 200ml", brand: "Bom Coco", category: "Mercearia", size: "200 ml", unit: "frasco", price: 4.9 },

  // Laticínios e frios
  { name: "Leite UHT Integral Piracanjuba 1L", brand: "Piracanjuba", category: "Laticínios", size: "1 L", unit: "caixa", price: 6.5 },
  { name: "Leite em Pó Ninho Integral Instantâneo 380g", brand: "Ninho", category: "Laticínios", size: "380 g", unit: "lata", price: 22.9 },
  { name: "Margarina Delícia com Creme de Leite 1kg", brand: "Delícia", category: "Laticínios", size: "1 kg", unit: "pote", price: 14.9 },
  { name: "Salsicha ao Molho Bordon 300g", brand: "Bordon", category: "Frios e Congelados", size: "300 g", unit: "lata", price: 12.9 },
  { name: "Almôndegas de Carne Bovina Pampeano 320g", brand: "Pampeano", category: "Frios e Congelados", size: "320 g", unit: "lata", price: 15.9 },
  { name: "Carne Bovina em Conserva Target 320g", brand: "Target", category: "Frios e Congelados", size: "320 g", unit: "lata", price: 16.9 },

  // Açougue e hortifruti
  { name: "Bisteca", brand: "Açougue local", category: "Açougue", size: "1 kg", unit: "kg", price: 27.9 },
  { name: "Batata Inglesa", brand: "Hortifruti local", category: "Hortifruti", size: "1 kg", unit: "kg", price: 7.5 },
  { name: "Cenoura", brand: "Hortifruti local", category: "Hortifruti", size: "1 kg", unit: "kg", price: 6.9 },

  // Biscoitos e cereais
  { name: "Biscoito Água e Sal Dallas 300g", brand: "Dallas", category: "Biscoitos", size: "300 g", unit: "pacote", price: 6.5 },
  { name: "Biscoito Cream Cracker Vivale 300g", brand: "Vivale", category: "Biscoitos", size: "300 g", unit: "pacote", price: 6.2 },
  { name: "Biscoito Salgado Mirim 300g", brand: "Mirim", category: "Biscoitos", size: "300 g", unit: "pacote", price: 5.9 },
  { name: "Biscoito Spantoo 80g", brand: "Spantoo", category: "Biscoitos", size: "80 g", unit: "pacote", price: 3.5 },
  { name: "Biscoito Spantoo Chocolate 30g", brand: "Spantoo", category: "Biscoitos", size: "30 g", unit: "pacote", price: 2.0 },
  { name: "Cereal Matinal Nescau 120g", brand: "Nescau", category: "Cereais", size: "120 g", unit: "caixa", price: 8.9 },
  { name: "Cereal Matinal Moça Flakes 120g", brand: "Moça", category: "Cereais", size: "120 g", unit: "caixa", price: 8.9 },
  { name: "Cereal Matinal Snow Flakes 120g", brand: "Snow Flakes", category: "Cereais", size: "120 g", unit: "caixa", price: 7.9 },
  { name: "Neston 3 Cereais Nestlé 360g", brand: "Nestlé", category: "Cereais", size: "360 g", unit: "caixa", price: 17.9 },

  // Limpeza
  { name: "Água Sanitária Ypê 1L", brand: "Ypê", category: "Limpeza", size: "1 L", unit: "frasco", price: 5.9 },
  { name: "Água Sanitária Ypê 2L", brand: "Ypê", category: "Limpeza", size: "2 L", unit: "frasco", price: 9.9 },
  { name: "Água Sanitária Cristal 1L", brand: "Cristal", category: "Limpeza", size: "1 L", unit: "frasco", price: 5.5 },
  { name: "Detergente Vida Neutro 500ml", brand: "Vida", category: "Limpeza", size: "500 ml", unit: "frasco", price: 3.2 },
  { name: "Detergente Vida Limão 500ml", brand: "Vida", category: "Limpeza", size: "500 ml", unit: "frasco", price: 3.2 },
  { name: "Sabão em Pó Tixan Ypê Primavera 400g", brand: "Tixan Ypê", category: "Limpeza", size: "400 g", unit: "pacote", price: 6.9 },
  { name: "Sabão em Pó Tixan Ypê Maciez 400g", brand: "Tixan Ypê", category: "Limpeza", size: "400 g", unit: "pacote", price: 6.9 },
  { name: "Lava Roupas em Pó Tixan Ypê Primavera 2.4kg", brand: "Tixan Ypê", category: "Limpeza", size: "2,4 kg", unit: "pacote", price: 32.9 },
  { name: "Lava Roupas em Pó Tixan Ypê Primavera 4kg", brand: "Tixan Ypê", category: "Limpeza", size: "4 kg", unit: "pacote", price: 49.9 },
  { name: "Limpador Multiuso Casa & Perfume 500ml", brand: "Casa & Perfume", category: "Limpeza", size: "500 ml", unit: "frasco", price: 7.5 },
  { name: "Limpador Urca Multiuso 2L", brand: "Urca", category: "Limpeza", size: "2 L", unit: "frasco", price: 12.9 },
  { name: "Inseticida Baygon Ação Total 360ml", brand: "Baygon", category: "Limpeza", size: "360 ml", unit: "aerossol", price: 21.9 },
  { name: "Inseticida Raid Base Água 300ml", brand: "Raid", category: "Limpeza", size: "300 ml", unit: "aerossol", price: 19.9 },
  { name: "Inseticida Mat Inset Multi 300ml", brand: "Mat Inset", category: "Limpeza", size: "300 ml", unit: "aerossol", price: 14.9 },

  // Higiene
  { name: "Papel Higiênico Cotton Deluxe Folha Dupla 4 unidades", brand: "Cotton", category: "Higiene", size: "4 rolos", unit: "pacote", price: 9.9 },
  { name: "Papel Higiênico Deluxe Cotton Folha Dupla Leve 12 Pague 11", brand: "Cotton", category: "Higiene", size: "12 rolos", unit: "pacote", price: 26.9 },
  { name: "Kit Dabelle Abacate Nutritivo (Shampoo + Condicionador)", brand: "Dabelle", category: "Higiene", size: "2 itens", unit: "kit", price: 29.9 },
  { name: "Kit Dabelle Liso Arrasador (Shampoo 250ml + Condicionador 175ml)", brand: "Dabelle", category: "Higiene", size: "2 itens", unit: "kit", price: 32.9 },
];

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);

/** Variação determinística por loja para os preços não ficarem idênticos. */
function priceForStore(base: number, storeIndex: number) {
  const factor = 1 + ((storeIndex % 4) - 1) * 0.045;
  return Math.max(0.5, Math.round(base * factor * 100) / 100);
}

export interface SeedResult {
  created: number;
  prices: number;
  errors: string[];
}

export interface SeedOptions {
  /** IDs dos estabelecimentos que receberão preço para cada produto. */
  storeIds: string[];
  /** Subconjunto de categorias; vazio = todas. */
  categories?: string[];
  onProgress?: (done: number, total: number, label: string) => void;
}

/**
 * Cadastra os produtos da semente e um preço por loja selecionada.
 * Erros por item são acumulados em vez de interromper a carga inteira.
 */
export async function seedAdminCatalog({ storeIds, categories, onProgress }: SeedOptions): Promise<SeedResult> {
  const items = categories?.length ? seedCatalog.filter(item => categories.includes(item.category)) : seedCatalog;
  const result: SeedResult = { created: 0, prices: 0, errors: [] };
  if (!storeIds.length) {
    result.errors.push("Selecione pelo menos um estabelecimento para receber os preços.");
    return result;
  }

  let done = 0;
  for (const item of items) {
    onProgress?.(done, items.length, item.name);
    const saved = await saveAdminProduct({
      name: item.name,
      brand: item.brand,
      category: item.category,
      size: item.size,
      unit: item.unit,
      slug: slugify(item.name),
    });
    if (saved.error || !saved.data) {
      result.errors.push(`${item.name}: ${saved.error || "não foi possível salvar"}`);
      done += 1;
      continue;
    }
    result.created += 1;
    for (let index = 0; index < storeIds.length; index += 1) {
      const priced = await setAdminProductPrice(saved.data, storeIds[index], priceForStore(item.price, index));
      if (priced.error) result.errors.push(`${item.name} (loja ${index + 1}): ${priced.error}`);
      else result.prices += 1;
    }
    done += 1;
    onProgress?.(done, items.length, item.name);
  }

  invalidateAdminCatalog();
  return result;
}

export const seedCategories = Array.from(new Set(seedCatalog.map(item => item.category)));
