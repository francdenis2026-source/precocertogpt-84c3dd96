import { Heart, Home, Search, ShoppingBasket, Store } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/buscar", label: "Buscar", icon: Search },
  { to: "/estabelecimentos", label: "Lojas", icon: Store },
  { to: "/cesta-inteligente", label: "Lista", icon: ShoppingBasket },
  { to: "/favoritos", label: "Salvos", icon: Heart },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const active = (to: string) => to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
  return <nav className="pc26-bottom-nav" aria-label="Navegação móvel">{items.map(({ to, label, icon: Icon }) => <Link key={to} className={active(to) ? "is-active" : undefined} aria-current={active(to) ? "page" : undefined} to={to}><Icon aria-hidden="true"/><span>{label}</span></Link>)}</nav>;
}
