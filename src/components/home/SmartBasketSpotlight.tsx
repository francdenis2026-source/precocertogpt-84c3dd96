import { useMemo } from "react";
import { ArrowRight, Clock, RefreshCw, ShoppingCart, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import basketImg from "../../assets/home-2026/hero-cliente-comparando-precos-2026.webp";

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

/** Chamadas de valor (identidade 2026-09, ver banco de fotos/
 *  precocerto_pacote_visual/cesta inteligente.png) — texto fixo, nenhum
 *  número inventado. */
const HIGHLIGHTS = [
  { icon: RefreshCw, title: "Comparação", text: "em tempo real" },
  { icon: Clock, title: "Mais economia", text: "na sua rotina" },
  { icon: Store, title: "Comércio local", text: "mais forte" },
] as const;

export function SmartBasketSpotlight({ products = [] }: { products?: Product[] }) {
  const sample = useMemo(() => pickBasketSample(products), [products]);
  // Economia real: soma, para os produtos da amostra, a diferença entre o
  // preço médio do catálogo e o menor preço encontrado — os dois números já
  // vêm calculados do catálogo, nada aqui é estimado às cegas.
  const estimatedSaving = useMemo(
    () => sample.reduce((total, product) => total + Math.max(0, product.avgPrice - product.minPrice), 0),
    [sample],
  );

  return (
    <section className="pcx-shell" aria-labelledby="smart-basket-title">
      <div className="pcx-spotlight"><img className="pcx-spotlight__photo" src={basketImg} alt="" loading="lazy" decoding="async" width="1280" height="720" />
        <div className="pcx-spotlight__copy">
          <span className="pcx-spotlight__badge">
            <ShoppingCart aria-hidden="true" />
            Cesta inteligente
          </span>
          <h2 id="smart-basket-title">
            Monte sua cesta <strong>e economize de verdade.</strong>
          </h2>
          <p>
            Compare preços automaticamente, encontre o menor valor e faça uma
            compra mais inteligente no comércio local.
          </p>
          <ul className="pcx-spotlight__highlights">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon aria-hidden="true" />
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
              </li>
            ))}
          </ul>
          <div className="pcx-spotlight__actions">
            <Link to="/cesta-inteligente" className="pcx-spotlight__cta">
              Criar minha cesta <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/cesta-inteligente" className="pcx-spotlight__link">
              Saiba como funciona <ArrowRight aria-hidden="true" />
            </Link>
          </div>
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
            {estimatedSaving > 0 && (
              <div className="pcx-spotlight__mock-saving">
                <span>Economia estimada</span>
                <strong>{brl.format(estimatedSaving)}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
