import {
  Beef,
  Croissant,
  LayoutGrid,
  Pill,
  ShoppingCart,
  Sandwich,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
const categories = [
  {
    label: "Mercados",
    sub: "Compare preços",
    icon: ShoppingCart,
    to: "/mercados",
  },
  {
    label: "Padarias",
    sub: "Pães e confeitaria",
    icon: Croissant,
    to: "/padarias",
  },
  { label: "Açougues", sub: "Carnes e cortes", icon: Beef, to: "/acougues" },
  { label: "Farmácias", sub: "Medicamentos", icon: Pill, to: "/farmacias" },
  {
    label: "Lanchonetes",
    sub: "Lanches e refeições",
    icon: Sandwich,
    to: "/lanchonetes",
  },
  { label: "Ofertas", sub: "Promoções especiais", icon: Tag, to: "/buscar" },
];
export function CategoryBar() {
  return (
    <section className="pcx-section pcx-section--muted" aria-labelledby="categories-title">
      <div className="pcx-shell">
        <div className="pcx-section__head">
          <div>
            <h2 id="categories-title">Explore por categoria</h2>
            <p>Entre direto no tipo de compra que você precisa.</p>
          </div>
          <Link className="pcx-section__link" to="/explorar">
            Ver todas <LayoutGrid aria-hidden="true" />
          </Link>
        </div>
        <div className="pcx-categories">
          {categories.map(({ label, sub, icon: Icon, to }) => (
            <Link className="pcx-category" key={label} to={to}>
              <i>
                <Icon aria-hidden="true" />
              </i>
              <strong>{label}</strong>
              <span>{sub}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
