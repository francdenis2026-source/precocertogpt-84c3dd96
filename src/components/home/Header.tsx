import {
  Home,
  LayoutGrid,
  Menu,
  Moon,
  Store,
  Sun,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSiteTheme } from "../../hooks/useSiteTheme";
import { HeaderRadioPlayer } from "../PersistentRadio";

function HeaderThemeToggle() {
  const { theme, toggleTheme } = useSiteTheme();
  const dark = theme === "dark";
  return (
    <button
      className="pcx-header__theme"
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
    >
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/buscar", label: "Buscar", icon: Tag },
  { to: "/estabelecimentos", label: "Estabelecimentos", icon: Store },
  { to: "/explorar", label: "Categorias", icon: LayoutGrid },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 8,
  );
  const { pathname } = useLocation();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const syncScrolledState = () => setScrolled(window.scrollY > 8);
    syncScrolledState();
    window.addEventListener("scroll", syncScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", syncScrolledState);
  }, []);

  const isCurrent = (to: string) =>
    to === "/"
      ? pathname === "/"
      : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <header
      className={`pcx-header${scrolled ? " is-scrolled" : ""}`}
      data-glass-header="true"
    >
      <div className="pcx-header__bar">
        <Link
          className="pcx-header__brand"
          to="/"
          aria-label="Preço Certo - página inicial"
        >
          <img src="/preco-certo-mark.svg?v=17" alt="" width="34" height="34" />
          <span>
            <strong>Preço Certo</strong>
            <small>Feijó · Acre</small>
          </span>
        </Link>

        <nav
          id="pcx-navigation"
          className={`pcx-header__nav${menuOpen ? " is-open" : ""}`}
          aria-label="Navegação principal"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isCurrent(item.to) ? "page" : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pcx-header__tools" role="group" aria-label="Ações da conta">
          <HeaderRadioPlayer />
          <HeaderThemeToggle />
          <Link className="pcx-header__login" to="/login">
            <UserRound aria-hidden="true" />
            <span>Entrar</span>
          </Link>

          <button
            className="pcx-header__menu"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="pcx-navigation"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
