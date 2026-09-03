import {
  Home,
  LayoutGrid,
  Menu,
  Search,
  Store,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/buscar", label: "Buscar", icon: Search },
  { to: "/buscar", label: "Ofertas", icon: Tag },
  { to: "/estabelecimentos", label: "Estabelecimentos", icon: Store },
  { to: "/explorar", label: "Categorias", icon: LayoutGrid },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 10,
  );
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const syncScrolledState = () => setScrolled(window.scrollY > 10);
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
      className={`pc26-header pc26-header--studio${scrolled ? " is-scrolled" : ""}`}
      data-glass-header="true"
    >
      <div className="pc26-shell pc26-header-studio">
        <Link
          className="pc26-header-studio__mobile-brand"
          to="/"
          aria-label="Preço Certo - página inicial"
        >
          <img
            src="/preco-certo-mark.svg?v=17"
            alt=""
            width="44"
            height="44"
          />
          <span>
            <strong>Preço Certo</strong>
            <small>FEIJÓ · ACRE</small>
          </span>
        </Link>

        <nav
          id="pc26-navigation"
          className={`pc26-header-studio__nav${menuOpen ? " is-open" : ""}`}
          aria-label="Navegação principal"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={`${item.to}-${item.label}`}
                to={item.to}
                aria-current={isCurrent(item.to) ? "page" : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pc26-header-studio__tools" role="group" aria-label="Ações da conta">
          <Link className="pc26-header-studio__login" to="/login">
            <UserRound aria-hidden="true" />
            <span>Entrar</span>
          </Link>

          <button
            className="pc26-header-studio__menu"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="pc26-navigation"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span>Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
