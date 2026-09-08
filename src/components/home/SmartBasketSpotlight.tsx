import { useMemo } from "react";
import { ArrowRight, Bot, Sparkles, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Até 3 produtos reais do catálogo já carregado, cada um com o
 *  estabelecimento onde está mais barato — para o mock de "monte sua cesta
 *  e compare" ao lado da chamada. Sem consulta nova: reaproveita a mesma
 *  lista de produtos que a home já buscou para o restante da página. */
function pickBasketSample(products: Product[]): Product[] {
  const seen = new Set<string>();
  const sample: Product[] = [];
  for (const product of products) {
    if (!product.minPrice || !product.establishment) continue;
    const key = product.category || product.name;
    if (seen.has(key)) continue;
    seen.add(key);
    sample.push(product);
    if (sample.length === 3) break;
  }
  return sample;
}

export function SmartBasketSpotlight({ products = [] }: { products?: Product[] }) {
  const sample = useMemo(() => pickBasketSample(products), [products]);

  return (
    <section className="pcx-shell" aria-labelledby="smart-basket-title">
      <div className="pcx-spotlight">
        <div className="pcx-spotlight__copy">
          <span className="pcx-spotlight__badge">
            <Sparkles aria-hidden="true" />
            Ferramenta com IA
          </span>
          <h2 id="smart-basket-title">Monte sua lista e descubra onde comprar mais barato</h2>
          <p>
            Diga o que você precisa e deixe a IA montar a lista com os menores preços
            entre os estabelecimentos de Feijó, comparando tudo por você em segundos.
          </p>
          <span className="pcx-spotlight__assistant">
            <span className="pcx-spotlight__assistant-icon"><Bot aria-hidden="true" /></span>
            Tem um assistente virtual para montar a cesta e ajudar na compra
          </span>
          <Link to="/cesta-inteligente" className="pcx-spotlight__cta">
            Criar cesta inteligente <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        {sample.length > 0 && (
          <div className="pcx-spotlight__mock" aria-label="Exemplo de comparação na cesta inteligente">
            <span className="pcx-spotlight__mock-head">Sua lista, comparada</span>
            <ul>
              {sample.map((product) => (
                <li key={product.id}>
                  <span className="pcx-spotlight__mock-name">{product.name}</span>
                  <span className="pcx-spotlight__mock-store">
                    <Store aria-hidden="true" /> {product.establishment}
                  </span>
                  <b>{brl.format(product.minPrice)}</b>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
