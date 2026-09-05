/* Chrome publico: cabecalho, rodape, dock e a barra minima.
 *
 * Estava tudo dentro de ReferenceExperience, junto com as telas de
 * estabelecimentos, login, colaborar e contato. Como praticamente toda pagina
 * do site usa PublicHeader/PublicFooter/AppDock, qualquer rota — inclusive a
 * home, que nao usa nenhuma daquelas telas — carregava as 25 folhas de estilo
 * daquele modulo antes da primeira pintura.
 *
 * Aqui ficam apenas o chrome e o CSS que o chrome precisa. As folhas das telas
 * continuam em ReferenceExperience, que agora entra sob demanda. */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BadgeCheck, Building2, Code2, Heart, Home, Info, LayoutDashboard, Mail,
  MapPin, Menu, MessageCircle, Moon, Search, ShieldCheck, ShoppingBag, ShoppingBasket,
  SlidersHorizontal, Store, Sun, UserRound, X,
} from "lucide-react";
import { OnlinePresence } from "../components/OnlinePresence";
import { HeaderRadioPlayer } from "../components/PersistentRadio";
import { useSiteTheme } from "../hooks/useSiteTheme";
import "./ReferenceExperience.css";
import "./CompactViewportPages.css";
import "./ReferenceResponsive.css";
import "./CompactShell.css";
import "./TypographyScale.css";
import "./InteractionPolish.css";
import "./DarkThemeRefinement.css";
import "./ProductCardRefinement.css";
import "./MobileAppRefinement.css";
import "./HomepageCompactDensity.css";
import "./Chrome2026.css";
import "./ReferencePagesMore.css";
import "./MinimalTopBar.css";
import "./PublicChromeRedesign2026.css";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link className="ref-brand" to="/" aria-label="PreçoCerto, início">
    {inverse
      ? <img className="ref-brand__inverse" src="/logo-preco-certo-inversa.svg?v=17" alt="PreçoCerto" />
      : <><img className="ref-brand__light" src="/logo-preco-certo.svg?v=17" alt="PreçoCerto" /><img className="ref-brand__dark" src="/logo-preco-certo-inversa.svg?v=17" alt="" aria-hidden="true" /></>}
    <span>FEIJÓ · ACRE</span>
  </Link>;
}

export type FooterPanel = "contato" | "desenvolvedor" | null;

export function FooterInfoDialogs({ open, onClose }: { open: FooterPanel; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') || []);
    window.requestAnimationFrame(() => focusables()[0]?.focus());
    const manageKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) { event.preventDefault(); dialog?.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", manageKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", manageKeyboard);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="pc-dev-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      {open === "contato"
        ? <section ref={dialogRef} className="pc-contact-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-contact-title" tabIndex={-1}>
            <button className="pc-dev-close" type="button" aria-label="Fechar contato" onClick={onClose}><X /></button>
            <span className="pc-contact-icon"><Mail aria-hidden="true" /></span>
            <div className="pc-contact-copy"><small>CANAL OFICIAL</small><h2 id="pc-contact-title">Fale com o PreçoCerto</h2><p>Dúvidas, sugestões, parcerias, informações sobre lojas virtuais ou suporte à plataforma.</p></div>
            <a className="pc-contact-email" href="mailto:precocerto-fj@proton.me"><Mail /> <span><small>E-mail</small><strong>precocerto-fj@proton.me</strong></span></a>
            <p className="pc-contact-note"><ShieldCheck /> Utilize este endereço para contatos relacionados ao PreçoCerto.</p>
          </section>
        : <section ref={dialogRef} className="pc-dev-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-dev-title" aria-describedby="pc-dev-description" tabIndex={-1}>
            <button className="pc-dev-close" type="button" aria-label="Fechar informações" onClick={onClose}><X /></button>
            <header className="pc-dev-header">
              <span className="pc-dev-avatar"><Store aria-hidden="true" /></span>
              <div><small>PREÇOCERTO · MARKETPLACE LOCAL</small><h2 id="pc-dev-title">Comércio local em uma plataforma própria.</h2><p>Catálogo, lojas virtuais, gestão de vendas e comparação de preços em um só ecossistema.</p></div>
            </header>
            <p id="pc-dev-description" className="pc-dev-intro">O PreçoCerto nasceu em Feijó-AC para aproximar consumidores, comerciantes e prestadores locais. Além da comparação de preços, a plataforma evolui como marketplace: cada negócio pode criar sua própria loja virtual, organizar produtos e administrar sua presença e suas vendas dentro do ecossistema.</p>
            <div className="pc-dev-grid">
              <article><ShoppingBag /><div><strong>Marketplace local</strong><p>Uma vitrine digital para negócios da cidade, reunindo descoberta, catálogo, comparação e jornada de compra em um ambiente único.</p></div></article>
              <article><Building2 /><div><strong>Loja virtual própria</strong><p>Comerciantes podem estruturar sua presença digital, publicar produtos e ofertas e gerenciar a operação da própria loja dentro da plataforma.</p></div></article>
              <article><ShieldCheck /><div><strong>Clareza para o consumidor</strong><p>Quando um estabelecimento ainda não possui venda direta habilitada, o PreçoCerto identifica a página como catálogo informativo para evitar confusão.</p></div></article>
              <article><Info /><div><strong>Informação para decidir melhor</strong><p>Preços e estabelecimentos são organizados para facilitar a comparação e ajudar o público a tomar decisões de compra com mais contexto.</p></div></article>
              <article><Code2 /><div><strong>Tecnologia da plataforma</strong><p>Aplicação web construída com React, TypeScript, Vite e integração com Supabase, preparada para experiências responsivas e evolução contínua.</p></div></article>
              <article><Heart /><div><strong>Projeto feito em Feijó</strong><p>Uma iniciativa local pensada para fortalecer a presença digital dos negócios e tornar o comércio da cidade mais acessível para quem compra.</p></div></article>
            </div>
            <div className="pc-dev-signature"><span><UserRound /> Desenvolvimento e idealização</span><strong>Franc D’nis</strong><small>Assinatura técnica do projeto</small></div>
            <footer className="pc-dev-footer"><span><MapPin /> Feijó · Acre · Brasil</span><button type="button" onClick={() => onClose()}><MessageCircle /> Fechar</button></footer>
          </section>}
    </div>,
    document.body,
  );
}
type BasketEntry = { productId: string; quantity: number };
const BASKET_KEY = "precocerto:active_basket_items";

function readBasket(): BasketEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(BASKET_KEY) || "[]") as Array<Partial<BasketEntry> & { id?: string | number }>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => ({ productId: String(item.productId ?? item.id ?? ""), quantity: Math.max(1, Number(item.quantity || 1)) })).filter(item => item.productId);
  } catch { return []; }
}

function writeBasket(items: BasketEntry[]) {
  localStorage.setItem(BASKET_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pc:basket-changed"));
}

function useBasket() {
  const [items, setItems] = useState<BasketEntry[]>(readBasket);
  useEffect(() => {
    const refresh = () => setItems(readBasket());
    window.addEventListener("storage", refresh);
    window.addEventListener("pc:basket-changed", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("pc:basket-changed", refresh); };
  }, []);
  const update = (productId: string | number, delta: number) => {
    const id = String(productId);
    const current = readBasket();
    const found = current.find(item => item.productId === id);
    const next = found
      ? current.map(item => item.productId === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0)
      : delta > 0 ? [...current, { productId: id, quantity: delta }] : current;
    writeBasket(next);
  };
  return { items, update, count: items.reduce((sum, item) => sum + item.quantity, 0) };
}

export function ThemeButton() {
  const { theme, toggleTheme } = useSiteTheme();
  const dark = theme === "dark";
  return <button className="ref-theme" type="button" onClick={toggleTheme} aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}>{dark ? <Sun /> : <Moon />}</button>;
}

type PublicSection = "home" | "sectors" | "search" | "basket" | "stores" | "profile";

function sectionFromPath(pathname: string): PublicSection | undefined {
  if (pathname === "/") return "home";
  if (["/explorar", "/mercados", "/farmacias", "/padarias", "/livros", "/servicos"].some((path) => pathname === path || pathname.startsWith(`${path}/`))) return "sectors";
  if (pathname.startsWith("/buscar") || pathname.startsWith("/produto/")) return "search";
  if (pathname.startsWith("/estabelecimentos") || pathname.startsWith("/estabelecimento/") || pathname.startsWith("/loja/")) return "stores";
  if (pathname.startsWith("/cesta")) return "basket";
  if (pathname.startsWith("/favoritos") || pathname.startsWith("/minha-conta")) return "profile";
  return undefined;
}

// A barra compacta (só com "Voltar") não recebia nenhum contexto da página:
// quem caía direto em /buscar, /cesta ou numa loja específica via link
// compartilhado não tinha nenhuma pista visual de onde estava. Um título
// padrão por rota cobre todas as páginas de uma vez; páginas com conteúdo
// dinâmico (como o nome da loja) podem sobrepor via a prop `title`/`logo`.
function defaultBackBarTitle(pathname: string): string | undefined {
  if (pathname === "/buscar") return "Buscar produtos";
  if (pathname === "/explorar") return "Onde comprar";
  if (pathname === "/estabelecimentos") return "Estabelecimentos";
  if (pathname.startsWith("/estabelecimento/") || pathname.startsWith("/loja/")) return "Estabelecimento";
  if (pathname === "/cesta" || pathname === "/cesta-basica") return "Sua cesta";
  if (pathname === "/cesta-inteligente") return "Cesta inteligente";
  return undefined;
}

export function PublicHeader({ current, backOnly = false, title, logo }: { current?: PublicSection; backOnly?: boolean; title?: string; logo?: string }) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > 10);
  const { count } = useBasket();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeSection = sectionFromPath(pathname) ?? current;
  const activeProps = (section: PublicSection) => ({
    className: activeSection === section ? "is-active" : "",
    "aria-current": activeSection === section ? ("page" as const) : undefined,
  });
  useEffect(() => { setMenu(false); }, [pathname]);
  useEffect(() => {
    const syncScrolledState = () => setScrolled(window.scrollY > 10);
    syncScrolledState();
    window.addEventListener("scroll", syncScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", syncScrolledState);
  }, []);
  if (backOnly) {
    const barTitle = title ?? defaultBackBarTitle(pathname);
    return <header className={`ref-header ref-header--back-only${scrolled ? " is-scrolled" : ""}`} data-glass-header="true">
    <div className="ref-shell ref-header__inner">
      <div className="ref-header__back-row">
        <button className="ref-header__back" type="button" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} aria-label="Voltar para a página anterior">
          <ArrowLeft aria-hidden="true" />
          <span>Voltar</span>
        </button>
        {barTitle && <div className="ref-header__context">
          {barTitle && <strong className="ref-header__context-title">{barTitle}</strong>}
        </div>}
      </div>
      <div className="ref-header__actions"><Link className="ref-header__home" to="/" aria-label="Ir para a página inicial"><Home aria-hidden="true" /><span>Início</span></Link>{pathname === "/" && <HeaderRadioPlayer />}<ThemeButton /></div>
    </div>
  </header>;
  }
  return <header className={`ref-header${scrolled ? " is-scrolled" : ""}`} data-glass-header="true">
    <div className="ref-shell ref-header__inner">
      <Link className="ref-header__app-brand" to="/" aria-label="Preço Certo, página inicial"><img src="/preco-certo-mark.svg?v=17" alt="" width="36" height="36"/><span><strong>Preço Certo</strong><small>Feijó, Acre</small></span></Link>
      <nav className="ref-nav" aria-label="Navegação principal">
        <Link {...activeProps("home")} to="/">Início</Link>
        <Link {...activeProps("sectors")} to="/explorar">Onde comprar</Link>
        <Link {...activeProps("search")} to="/buscar">Buscar</Link>
        <Link {...activeProps("stores")} to="/estabelecimentos">Estabelecimentos</Link>
        <Link {...activeProps("basket")} to="/cesta-basica">Lista {count > 0 && <b>{count}</b>}</Link>
      </nav>
      <div className="ref-header__utility">
        <span className="ref-location"><MapPin aria-hidden="true" /><span><small>Você está em</small><strong>Feijó, AC</strong></span></span>
        {activeSection === "home" && <OnlinePresence />}
      </div>
      <div className="ref-header__actions">
        {pathname === "/" && <HeaderRadioPlayer />}
        <ThemeButton />
        <Link className={`ref-favorites-link${activeSection === "profile" ? " is-active" : ""}`} aria-current={activeSection === "profile" ? "page" : undefined} to="/favoritos" aria-label="Favoritos"><Heart /></Link>
        <Link className="ref-signin" to="/login">Entrar</Link>
        <button type="button" className="ref-menu" aria-label={menu ? "Fechar menu" : "Abrir menu"} aria-expanded={menu} onClick={() => setMenu(value => !value)}>{menu ? <X /> : <Menu />}</button>
      </div>
    </div>
    {menu && <nav className="ref-mobile-menu" aria-label="Menu">
      <Link {...activeProps("sectors")} to="/explorar" onClick={() => setMenu(false)}><SlidersHorizontal aria-hidden="true" /> Onde comprar</Link>
      <Link {...activeProps("search")} to="/buscar" onClick={() => setMenu(false)}><Search aria-hidden="true" /> Buscar no PreçoCerto</Link>
      <Link {...activeProps("stores")} to="/estabelecimentos" onClick={() => setMenu(false)}><Store aria-hidden="true" /> Estabelecimentos</Link>
      <Link {...activeProps("basket")} to="/cesta-basica" onClick={() => setMenu(false)}><ShoppingBasket aria-hidden="true" /> Lista de compras</Link>
      <Link {...activeProps("profile")} to="/favoritos" onClick={() => setMenu(false)}><Heart aria-hidden="true" /> Meus favoritos</Link>
      <Link to="/lojista" onClick={() => setMenu(false)}><Building2 aria-hidden="true" /> Para negócios</Link>
      <div className="ref-mobile-menu__footer"><ThemeButton /><span>Alterar tema</span></div>
    </nav>}
  </header>;
}

/* Rodape unico do site.
 *
 * Antes havia aqui uma grade de quatro colunas com doze links, e toda ela era
 * escondida por CSS (`.ref-footer__grid{display:none!important}`) em todas as
 * paginas. Ou seja: doze links invisiveis viajavam no HTML de cada rota, sem
 * servir a ninguem, e o que sobrava na tela era so a linha legal, ocupando
 * quase 200px de altura.
 *
 * Agora o que existe no HTML e o que aparece na tela: uma barra com a marca,
 * os quatro destinos que as pessoas realmente procuram no rodape, e a linha
 * legal com o aviso de preco. */
export function PublicFooter() {
  return <footer className="ref-footer">
    <div className="ref-shell ref-footer__bar">
      <Link className="ref-footer__mark" to="/" aria-label="Preço Certo, página inicial">
        <img src="/preco-certo-mark.svg?v=17" alt="" width="26" height="26" />
        <span><strong>Preço Certo</strong><small>Feijó, Acre</small></span>
      </Link>
      <nav className="ref-footer__links" aria-label="Links do rodapé">
        <Link to="/sobre">Sobre</Link>
        <Link to="/estabelecimentos">Estabelecimentos</Link>
        <Link to="/lojista">Área do lojista</Link>
        <Link to="/colaborar">Colaborar</Link>
        <Link to="/contato">Fale conosco</Link>
      </nav>
    </div>
    <div className="ref-shell ref-footer__legal">
      <small>&copy; 2026 PreçoCerto · Feijó, Acre · dev &lt;Franc D’nis&gt;</small>
      <span><BadgeCheck aria-hidden="true" /> Preços podem mudar. Confirme no estabelecimento antes da compra.</span>
    </div>
  </footer>;
}

export function AppDock({ current }: { current?: "home" | "search" | "explore" | "basket" | "stores" | "profile" }) {
  const { pathname } = useLocation();
  const { count } = useBasket();
  const active = current ?? (pathname === "/" ? "home"
    : pathname.startsWith("/buscar") || pathname.startsWith("/produto/") ? "search"
    : pathname.startsWith("/cesta") ? "basket"
    : pathname.startsWith("/minha-conta") || pathname.startsWith("/favoritos") || pathname.startsWith("/login") || pathname.startsWith("/cadastro") ? "profile"
    : "explore");
  return <nav className="ref-dock" aria-label="Navegação principal do aplicativo">
    <Link className={active === "home" ? "is-active" : ""} to="/" aria-current={active === "home" ? "page" : undefined}><LayoutDashboard aria-hidden="true" /><span>Início</span></Link>
    <Link className={active === "search" ? "is-active" : ""} to="/buscar" aria-current={active === "search" ? "page" : undefined}><Search aria-hidden="true" /><span>Buscar</span></Link>
    <Link className={active === "explore" || active === "stores" ? "is-active" : ""} to="/explorar" aria-current={active === "explore" || active === "stores" ? "page" : undefined}><SlidersHorizontal aria-hidden="true" /><span>Explorar</span></Link>
    <Link className={active === "basket" ? "is-active" : ""} to="/cesta-basica" aria-current={active === "basket" ? "page" : undefined}><ShoppingBasket aria-hidden="true" />{count > 0 && <b className="ref-dock__badge" aria-label={`${count} itens na cesta`}>{count > 99 ? "99+" : count}</b>}<span>Cesta</span></Link>
    <Link className={active === "profile" ? "is-active" : ""} to="/minha-conta" aria-current={active === "profile" ? "page" : undefined}><UserRound aria-hidden="true" /><span>Conta</span></Link>
  </nav>;
}
/**
 * Substitui o header fixo em páginas sem navegação (colaborar, contato,
 * detalhe de estabelecimento): sem barra sólida ocupando espaço — só a
 * logomarca e um botão de voltar flutuando sobre o topo da página.
 */
export function MinimalTopBar({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const navigate = useNavigate();
  return <div className={`pc-mini-top pc-mini-top--${variant}`}>
    <Link className="pc-mini-top__brand" to="/" aria-label="Preço Certo, página inicial">
      <img src="/preco-certo-mark.svg?v=17" alt="" width="34" height="34" />
      <span><strong>Preço Certo</strong><small>Feijó, Acre</small></span>
    </Link>
    <button type="button" className="pc-mini-top__back" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} aria-label="Voltar para a página anterior">
      <ArrowLeft aria-hidden="true" />
    </button>
  </div>;
}
