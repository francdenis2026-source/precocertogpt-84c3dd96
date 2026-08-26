import { Heart, Home, Search, ShoppingBasket, Store } from "lucide-react";
import { Link } from "react-router-dom";
export function BottomNav() { return <nav className="pc26-bottom-nav" aria-label="Navegação móvel"><Link className="is-active" to="/"><Home aria-hidden="true"/>Início</Link><Link to="/buscar"><Search aria-hidden="true"/>Buscar</Link><Link to="/estabelecimentos"><Store aria-hidden="true"/>Lojas</Link><Link to="/cesta-inteligente"><ShoppingBasket aria-hidden="true"/>Lista</Link><Link to="/favoritos"><Heart aria-hidden="true"/>Salvos</Link></nav>; }
