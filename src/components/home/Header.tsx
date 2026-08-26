import { Heart, MapPin, Menu, Moon, Search, ShoppingBasket, Sun, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Header({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  const navigate = useNavigate(); const [query, setQuery] = useState(""); const [menuOpen, setMenuOpen] = useState(false);
  const search = (event: FormEvent) => { event.preventDefault(); if (query.trim()) navigate(`/buscar?q=${encodeURIComponent(query.trim())}`); };
  return <header className="pc-header"><div className="nx-shell pc-header__row">
    <Link className="pc-logo" to="/" aria-label="Preço Certo, início"><img src="/logo-preco-certo-light.svg" alt="Preço Certo" /></Link>
    <form className="pc-search" role="search" onSubmit={search}><Search aria-hidden="true" /><label className="sr-only" htmlFor="price-search">Buscar produtos</label><input id="price-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="O que você procura hoje?" /><span className="pc-search__city"><MapPin />Feijó, AC</span><button type="submit">Buscar ofertas</button></form>
    <div className="pc-actions"><button className="pc-icon-button" type="button" onClick={onToggleTheme} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>{theme === "dark" ? <Sun /> : <Moon />}</button><Link className="pc-icon-button" to="/favoritos" aria-label="Favoritos"><Heart /></Link><Link className="pc-login" to="/login"><UserRound />Entrar</Link><button className="pc-icon-button pc-menu" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="pc-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}><Menu /></button></div>
  </div><nav id="pc-navigation" className={`pc-nav${menuOpen ? " is-open" : ""}`}><div className="nx-shell pc-nav__row"><Link to="/" aria-current="page" onClick={() => setMenuOpen(false)}>Início</Link><Link to="/explorar" onClick={() => setMenuOpen(false)}>Categorias</Link><Link to="/buscar" onClick={() => setMenuOpen(false)}>Ofertas</Link><Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Lojas</Link><Link to="/cesta-inteligente" onClick={() => setMenuOpen(false)}><ShoppingBasket /> Minha Lista</Link></div></nav></header>;
}
