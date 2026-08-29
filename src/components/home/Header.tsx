import { Heart, LayoutGrid, MapPin, Menu, Moon, Percent, Search, ShoppingBasket, Store, Sun, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HeaderRadioPlayer } from "../PersistentRadio";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/buscar", label: "Buscar", icon: Search },
  { to: "/explorar", label: "Categorias", icon: LayoutGrid },
  { to: "/estabelecimentos", label: "Lojas", icon: Store },
  { to: "/buscar", label: "Promoções", icon: Percent },
  { to: "/cesta-inteligente", label: "Cesta Inteligente", icon: ShoppingBasket },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
];

export function Header({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/buscar?q=${encodeURIComponent(value)}` : "/buscar");
  };
  const isCurrent = (to: string) => to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

  return <header className="pc26-header pc26-header--studio pc26-reference-header">
    <div className="pc26-reference-header__top pc26-shell">
      <Link className="pc26-header-studio__mobile-brand" to="/" aria-label="Preço Certo - página inicial">
        <img src="/preco-certo-mark.svg" alt="" width="38" height="38" />
        <span><strong>Preço Certo</strong><small>O menor preço da cidade, na palma da sua mão.</small></span>
      </Link>

      <form className="pc26-reference-header__search" onSubmit={submitSearch} role="search">
        <Search aria-hidden="true" />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Busque por produtos, marcas ou estabelecimentos..." aria-label="Buscar no Preço Certo" />
        <button type="submit" aria-label="Buscar"><Search aria-hidden="true" /></button>
      </form>

      <div className="pc26-reference-header__actions">
        <span className="pc26-reference-header__location"><MapPin aria-hidden="true" /> Feijó - AC</span>
        <button className="pc26-header-studio__tool pc26-header-studio__theme" type="button" onClick={onToggleTheme} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>{theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</button>
        <Link className="pc26-reference-header__enter" to="/login">Entrar</Link>
        <Link className="pc26-reference-header__signup" to="/cadastro">Cadastrar</Link>
        <button className="pc26-header-studio__tool pc26-header-studio__menu" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="pc26-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      </div>
    </div>

    <div className="pc26-reference-header__nav-wrap">
      <div className="pc26-shell pc26-reference-header__navline">
        <nav id="pc26-navigation" className={`pc26-header-studio__nav${menuOpen ? " is-open" : ""}`} aria-label="Navegação principal">
          {navItems.map(item => {
            const Icon = item.icon;
            return <Link key={`${item.to}-${item.label}`} to={item.to} aria-current={isCurrent(item.to) ? "page" : undefined}>{Icon ? <Icon aria-hidden="true" /> : null}<span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="pc26-reference-header__radio" aria-label="Rádio"><HeaderRadioPlayer /></div>
      </div>
    </div>
  </header>;
}
