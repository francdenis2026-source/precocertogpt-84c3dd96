import {
  Beef,
  BookOpen,
  Croissant,
  LayoutGrid,
  Pill,
  Sandwich,
  ShoppingCart,
  Wrench,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { businessGroups, groupForStore, type BusinessGroupId } from "../../data/businessTaxonomy";
import type { StoreRow } from "../../data/catalog";
import { SectionHeader } from "./SectionHeader";

const intBr = new Intl.NumberFormat("pt-BR");

/* Ícones e subtítulos por grupo — os grupos em si (nomes, rotas, quais tipos
 * de negócio cada um reúne) vêm de businessTaxonomy.ts, a mesma fonte usada
 * pelas rotas /mercados, /acougues etc. em App.tsx. Nada aqui é inventado:
 * é só a camada visual (ícone Lucide + subtítulo curto) sobre grupos reais. */
const CATEGORY_ICON: Record<BusinessGroupId, LucideIcon> = {
  markets: ShoppingCart,
  butchers: Beef,
  bakery: Croissant,
  food: Sandwich,
  pharmacies: Pill,
  books: BookOpen,
  services: Wrench,
  other: Tag,
};

const CATEGORY_SUB: Record<BusinessGroupId, string> = {
  markets: "Compare preços",
  butchers: "Carnes e cortes",
  bakery: "Pães e confeitaria",
  food: "Lanches e refeições",
  pharmacies: "Medicamentos",
  books: "Livros e cultura",
  services: "Profissionais locais",
  other: "Outros comércios",
};

/* Fundo pastel por categoria (como no pacote de referência visual: cada
 * categoria com uma cor sutil própria, não tudo verde). Só o chip do ícone
 * muda — o card continua branco. */
const CATEGORY_TINT: Record<BusinessGroupId, string> = {
  markets: "pcx-category--green",
  butchers: "pcx-category--red",
  bakery: "pcx-category--amber",
  food: "pcx-category--orange",
  pharmacies: "pcx-category--blue",
  books: "pcx-category--violet",
  services: "pcx-category--slate",
  other: "pcx-category--pink",
};

export function CategoryBar({ stores = [] }: { stores?: StoreRow[] }) {
  const rail = useRef<HTMLDivElement>(null);
  // Soma real de produtos por grupo, a partir da contagem que cada loja já
  // carrega (StoreRow.products) — nenhum número inventado; some 0 vira só o
  // subtítulo genérico de CATEGORY_SUB (ex.: durante o carregamento).
  const productCountByGroup = useMemo(() => {
    const totals = new Map<BusinessGroupId, number>();
    for (const store of stores) {
      if (!store.products) continue;
      const groupId = groupForStore(store).id;
      totals.set(groupId, (totals.get(groupId) || 0) + store.products);
    }
    return totals;
  }, [stores]);

  return (
    <section className="pcx-section pcx-section--muted" aria-labelledby="categories-title">
      <div className="pcx-shell">
        <SectionHeader
          id="categories-title"
          title="Explore por categoria"
          description="Entre direto no tipo de compra que você precisa."
          linkTo="/explorar"
          linkLabel="Ver todas"
          linkIcon={<LayoutGrid aria-hidden="true" />}
        />
        <div className="pcx-category-controls" aria-label="Navegar pelas categorias">
          <button type="button" aria-label="Categorias anteriores" onClick={() => rail.current?.scrollBy({ left: -280 })}>←</button>
          <button type="button" aria-label="Próximas categorias" onClick={() => rail.current?.scrollBy({ left: 280 })}>→</button>
        </div>
        <div className="pcx-categories" ref={rail} aria-label="Categorias de estabelecimentos">
          {businessGroups.map((group) => {
            const Icon = CATEGORY_ICON[group.id];
            const productCount = productCountByGroup.get(group.id);
            return (
              <Link className="pcx-category" key={group.id} to={group.href}>
                <i className={CATEGORY_TINT[group.id]}>
                  <Icon aria-hidden="true" />
                </i>
                <span className="pcx-category__text">
                  <strong>{group.shortLabel}</strong>
                  <span>{productCount ? `${intBr.format(productCount)} produtos` : CATEGORY_SUB[group.id]}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
