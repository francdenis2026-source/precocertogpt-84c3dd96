import { Heart, Menu, Moon, Search, ShoppingBasket, Sun, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HeaderRadioPlayer } from "../PersistentRadio";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/explorar", label: "Explorar" },
  { to: "/buscar", label: "Ofertas" },
  { to: "/estabelecimentos", label: "Lojas" },
];

export function Header({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const focusSearch = () => document.getElementById("price-search")?.focus();
  const isCurrent = (to: string) => to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

  return <header className="pc26-header pc26-header--studio">
    <div className="pc26-shell pc26-header-studio">
      <Link className="pc26-header-studio__mobile-brand" to="/" aria-label="Preço Certo - página inicial">
        <img src="/preco-certo-mark.svg" alt="" width="38" height="38" />
        <span><strong>Preço Certo</strong><small>Feijó, Acre</small></span>
      </Link>
      <div className="pc26-header-studio__radio" aria-label="Rádio ao vivo"><HeaderRadioPlayer /></div>

      <nav id="pc26-navigation" className={`pc26-header-studio__nav${menuOpen ? " is-open" : ""}`} aria-label="Navegação principal">
        {navItems.map(item => <Link key={item.to} to={item.to} aria-current={isCurrent(item.to) ? "page" : undefined} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
      </nav>

      <div className="pc26-header-studio__tools" aria-label="Ações rápidas">
        <button className="pc26-header-studio__tool pc26-header-studio__search" type="button" onClick={focusSearch} aria-label="Pesquisar produtos" title="Pesquisar produtos"><Search aria-hidden="true" /></button>
        <Link className="pc26-header-studio__tool" to="/favoritos" aria-label="Favoritos" title="Favoritos"><Heart aria-hidden="true" /></Link>
        <Link className="pc26-header-studio__tool pc26-header-studio__basket" to="/cesta-inteligente" aria-label="Abrir cesta inteligente" title="Cesta inteligente"><ShoppingBasket aria-hidden="true" /></Link>
        <button className="pc26-header-studio__tool" type="button" onClick={onToggleTheme} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} title={theme === "dark" ? "Modo claro" : "Modo escuro"}>{theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</button>
        <Link className="pc26-header-studio__login" to="/login"><UserRound aria-hidden="true" /><span>Entrar</span></Link>
        <button className="pc26-header-studio__tool pc26-header-studio__menu" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="pc26-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      </div>
    </div>
  </header>;
}
