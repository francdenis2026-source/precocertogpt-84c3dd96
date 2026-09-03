import { ArrowRight, LayoutGrid, Search, ShoppingBasket, Store } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    to: "/buscar",
    icon: Search,
    label: "Comparar preços",
    detail: "Encontre o menor valor",
  },
  {
    to: "/explorar",
    icon: LayoutGrid,
    label: "Explorar setores",
    detail: "Tudo por categoria",
  },
  {
    to: "/estabelecimentos",
    icon: Store,
    label: "Ver estabelecimentos",
    detail: "Comércios de Feijó",
  },
  {
    to: "/cesta-inteligente",
    icon: ShoppingBasket,
    label: "Cesta inteligente",
    detail: "Organize sua compra",
  },
] as const;

export function HomeQuickActions() {
  return (
    <nav
      className="pc26-home-actions pc26-shell"
      aria-label="Principais funcionalidades"
    >
      {actions.map(({ to, icon: Icon, label, detail }) => (
        <Link
          key={to}
          to={to}
          className="pc26-quick-action-link"
          aria-label={`${label}: ${detail}`}
        >
          <i className="pc26-quick-action-icon">
            <Icon aria-hidden="true" />
          </i>
          <span className="pc26-quick-action-text">
            <strong>{label}</strong>
            <small>{detail}</small>
          </span>
          <ArrowRight className="pc26-quick-action-arrow" aria-hidden="true" size={16} />
        </Link>
      ))}
    </nav>
  );
}
