import { LayoutGrid, Search, ShoppingBasket, Store } from "lucide-react";
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
    <nav className="pcx-shell" aria-label="Principais funcionalidades">
      <div className="pcx-actions">
        {actions.map(({ to, icon: Icon, label, detail }) => (
          <Link key={to} to={to} aria-label={`${label}: ${detail}`}>
            <i className="pcx-actions__icon">
              <Icon aria-hidden="true" />
            </i>
            <span className="pcx-actions__text">
              <strong>{label}</strong>
              <small>{detail}</small>
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
