import { Heart, MapPin, Menu, Moon, ShoppingBasket, Sun, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { HeaderRadioPlayer } from "../PersistentRadio";
import { LiveProductSearch } from "./LiveProductSearch";

export function Header({ theme, onToggleTheme, products, loading }: { theme: string; onToggleTheme: () => void; products: Product[]; loading: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return <header className="pc26-header">
    <div className="pc26-shell pc26-header__row pc26-header__primary">
      <div className="pc26-header__radio" aria-label="Rádio ao vivo">
        <HeaderRadioPlayer />
      </div>

      <div className="pc26-header__search">
        <LiveProductSearch id="price-search" products={products} loading={loading} compact />
      </div>

      <div className="pc26-actions" aria-label="Ações rápidas">
        <Link className="pc26-header-action pc26-header-action--text" to="/estabelecimentos" aria-label="Ver lojas e estabelecimentos">
          <MapPin aria-hidden="true" />
          <span>Lojas</span>
        </Link>
        <Link className="pc26-header-action" to="/favoritos" aria-label="Favoritos" title="Favoritos">
          <Heart aria-hidden="true" />
        </Link>
        <Link className="pc26-header-action" to="/cesta-inteligente" aria-label="Minha lista" title="Minha lista">
          <ShoppingBasket aria-hidden="true" />
        </Link>
        <button className="pc26-header-action" type="button" onClick={onToggleTheme} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} title={theme === "dark" ? "Modo claro" : "Modo escuro"}>
          {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </button>
        <Link className="pc26-login" to="/login">
          <UserRound aria-hidden="true" />
          <span>Entrar</span>
        </Link>
        <button className="pc26-header-action pc26-menu" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="pc26-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>
          <Menu aria-hidden="true" />
        </button>
      </div>
    </div>

    <nav id="pc26-navigation" className={`pc26-nav${menuOpen ? " is-open" : ""}`} aria-label="Navegação principal">
      <div className="pc26-shell pc26-nav__row">
        <Link to="/" aria-current="page" onClick={() => setMenuOpen(false)}>Início</Link>
        <Link to="/explorar" onClick={() => setMenuOpen(false)}>Explorar</Link>
        <Link to="/buscar" onClick={() => setMenuOpen(false)}>Ofertas</Link>
        <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link>
        <Link to="/cesta-inteligente" onClick={() => setMenuOpen(false)}>Cesta inteligente</Link>
      </div>
    </nav>
  </header>;
}
