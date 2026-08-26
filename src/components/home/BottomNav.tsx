import { Heart, Home, Search, ShoppingBasket, Store } from "lucide-react";
import { Link } from "react-router-dom";
export function BottomNav() { return <nav className="pc-bottom-nav" aria-label="Navegação móvel"><Link className="is-active" to="/"><Home />Início</Link><Link to="/buscar"><Search />Buscar</Link><Link to="/estabelecimentos"><Store />Lojas</Link><Link to="/cesta-inteligente"><ShoppingBasket />Lista</Link><Link to="/favoritos"><Heart />Salvos</Link></nav>; }
