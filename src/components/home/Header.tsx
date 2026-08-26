import { Heart, Menu, Moon, ShoppingBasket, Sun, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/catalog";
import { LiveProductSearch } from "./LiveProductSearch";

export function Header({ theme, onToggleTheme, products, loading }: { theme: string; onToggleTheme: () => void; products: Product[]; loading: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="pc26-header"><div className="pc26-shell pc26-header__row">
    <Link className="pc26-logo" to="/" aria-label="Preço Certo, início"><img src="/logo-preco-certo-light.svg?v=20260825-cart" alt="Preço Certo" width="184" height="56" /></Link>
    <LiveProductSearch id="price-search" products={products} loading={loading} compact />
    <div className="pc26-actions"><button className="pc26-icon-button" type="button" onClick={onToggleTheme} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>{theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</button><Link className="pc26-icon-button" to="/favoritos" aria-label="Favoritos"><Heart aria-hidden="true" /></Link><Link className="pc26-login" to="/login"><UserRound aria-hidden="true" />Entrar</Link><button className="pc26-icon-button pc26-menu" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="pc26-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}><Menu aria-hidden="true" /></button></div>
  </div><nav id="pc26-navigation" className={`pc26-nav${menuOpen ? " is-open" : ""}`} aria-label="Navegação principal"><div className="pc26-shell pc26-nav__row"><Link to="/" aria-current="page" onClick={() => setMenuOpen(false)}>Início</Link><Link to="/explorar" onClick={() => setMenuOpen(false)}>Categorias</Link><Link to="/buscar" onClick={() => setMenuOpen(false)}>Ofertas</Link><Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Lojas</Link><Link to="/cesta-inteligente" onClick={() => setMenuOpen(false)}><ShoppingBasket aria-hidden="true" />Minha lista</Link></div></nav></header>;
}
