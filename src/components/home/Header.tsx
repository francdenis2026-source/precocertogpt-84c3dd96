import { Heart, Menu, Moon, ShoppingBasket, Sun, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { HeaderRadioPlayer } from "../PersistentRadio";

const navItems = [
  { to: "/", label: "Início", current: true },
  { to: "/explorar", label: "Explorar" },
  { to: "/buscar", label: "Ofertas" },
  { to: "/estabelecimentos", label: "Estabelecimentos" },
  { to: "/cesta-inteligente", label: "Cesta inteligente" },
];

export function Header({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return <header className="pc26-header">
    <div className="pc26-shell pc26-header__row pc26-header__primary">
      <div className="pc26-header__radio" aria-label="Rádio ao vivo"><HeaderRadioPlayer /></div>

      <nav id="pc26-navigation" className={`pc26-header-nav${menuOpen ? " is-open" : ""}`} aria-label="Navegação principal">
        {navItems.map(item => <Link key={item.to} to={item.to} aria-current={item.current ? "page" : undefined} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
      </nav>

      <div className="pc26-actions" aria-label="Ações rápidas">
        <Link className="pc26-header-action" to="/favoritos" aria-label="Favoritos" title="Favoritos"><Heart aria-hidden="true" /></Link>
        <Link className="pc26-header-action" to="/cesta-inteligente" aria-label="Minha lista" title="Minha lista"><ShoppingBasket aria-hidden="true" /></Link>
        <button className="pc26-header-action" type="button" onClick={onToggleTheme} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} title={theme === "dark" ? "Modo claro" : "Modo escuro"}>{theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</button>
        <Link className="pc26-login" to="/login"><UserRound aria-hidden="true" /><span>Entrar</span></Link>
        <button className="pc26-header-action pc26-menu" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="pc26-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      </div>
    </div>
  </header>;
}
