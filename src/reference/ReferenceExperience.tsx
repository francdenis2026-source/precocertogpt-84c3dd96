import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { sanitizeRedirect } from "../auth/safeRedirect";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BadgeCheck, Building2, Camera,
  Check, Code2, Eye, Heart, Info, LayoutDashboard, LockKeyhole, Mail, Map as MapIcon,
  MapPin, Menu, MessageCircle, Minus, Moon, PackageSearch, PiggyBank, Plus, Search, ShieldCheck, ShoppingBag, ShoppingBasket,
  ReceiptText, SlidersHorizontal, Store, Sun, Tag, TrendingDown, UserRound, UsersRound, WalletCards, X,
  Home,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import contactHeroImg from "../assets/home-2026/comercio-local-atendimento.jpg";
import collabHeroImg from "../assets/home-2026/hero-mulher-app-precocerto.jpg";
import { fetchCatalog, normalize } from "../data/remoteCatalog";
import { fetchSectorCatalog, withoutDemoEstablishments } from "../data/sectorCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { getStoreLogoUrl } from "../data/storeLogos";
import { loadSessionProfile, requestPasswordReset } from "../lib/roles";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import { OnlinePresence } from "../components/OnlinePresence";
import { HeaderRadioPlayer } from "../components/PersistentRadio";
import { useSiteTheme } from "../hooks/useSiteTheme";
import { groupForStore } from "../data/businessTaxonomy";
import { SectorNavigator, getMarketplaceSector } from "./MarketplaceSectors";
import { AppDock, Brand, MinimalTopBar, PublicFooter, PublicHeader, ThemeButton } from "./PublicChrome";
export { AppDock, Brand, FooterInfoDialogs, MinimalTopBar, PublicFooter, PublicHeader } from "./PublicChrome";
export type { FooterPanel } from "./PublicChrome";
import "./ReferencePages.css";
import "./SearchResultsRefinement.css";
import "./ProductComparisonRefinement.css";
import "./Home2026.css";
import "./Stores2026.css";
import "./StoresProfessionalRebuild.css";
import "./CollaborationPage.css";
import "./ContactPage.css";
import "./AdminMerchantRedesign2026.css";
import "./StoresDirectoryRedesign2026.css";

const initialCatalog = buildCatalog();
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlWhole = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const percentage = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("pt-BR");
const clampSmartBudget = (value: number) => Math.min(10000, Math.max(50, Math.round(value)));

function ProductRangeSummary({ product }: { product: Product }) {
  const storeCount = product.storeCount || product.offers?.length || 1;
  const difference = Math.max(0, product.maxPrice - product.minPrice);

  if (storeCount <= 1) return <>{brl.format(product.minPrice)}<small>1 loja consultada</small></>;
  if (difference <= 0) return <>{brl.format(product.minPrice)}<small>Mesmo preço em {storeCount} lojas</small></>;

  return <>{brl.format(product.minPrice)} — {brl.format(product.maxPrice)}<small>{storeCount} lojas comparadas · diferença de {brl.format(difference)}</small></>;
}

function normalizeProductSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
}

type ProductComparisonOffer = {
  establishment: string;
  neighborhood: string;
  value: number;
};

function compareProductAcrossStores(products: Product[], selected: Product | null) {
  if (!selected) return null;

  const selectedName = normalizeProductSearch(selected.name);
  const selectedSize = normalizeProductSearch(selected.size || "");
  const selectedBarcode = normalizeProductSearch(selected.barcode || "");
  const matchingProducts = products.filter(product => {
    const barcode = normalizeProductSearch(product.barcode || "");
    if (selectedBarcode && barcode) return barcode === selectedBarcode;
    return normalizeProductSearch(product.name) === selectedName
      && normalizeProductSearch(product.size || "") === selectedSize;
  });

  const offers: ProductComparisonOffer[] = [];
  matchingProducts.forEach(product => {
    if (product.offers?.length) {
      product.offers.forEach(offer => {
        if (Number.isFinite(offer.value) && offer.value > 0) offers.push({
          establishment: offer.establishment || "Comércio local",
          neighborhood: offer.neighborhood || "Feijó",
          value: offer.value,
        });
      });
      return;
    }
    if (Number.isFinite(product.minPrice) && product.minPrice > 0) offers.push({
      establishment: product.establishment || "Comércio local",
      neighborhood: product.neighborhood || "Feijó",
      value: product.minPrice,
    });
  });

  const uniqueByStore = new Map<string, ProductComparisonOffer>();
  offers.forEach(offer => {
    const storeKey = normalizeProductSearch(offer.establishment);
    const current = uniqueByStore.get(storeKey);
    if (!current || offer.value < current.value) uniqueByStore.set(storeKey, offer);
  });

  const ranked = [...uniqueByStore.values()].sort((a, b) => a.value - b.value);
  if (!ranked.length) return null;
  const lowest = ranked[0];
  const highest = ranked[ranked.length - 1];
  const difference = Math.max(0, highest.value - lowest.value);
  return {
    lowest,
    highest,
    difference,
    percentage: highest.value > 0 ? (difference / highest.value) * 100 : 0,
    storeCount: ranked.length,
  };
}

function productSearchScore(product: Product, rawQuery: string) {
  const term = normalizeProductSearch(rawQuery);
  if (!term) return 0;
  const name = normalizeProductSearch(product.name);
  const queryWords = term.split(/\s+/).filter(Boolean);
  const nameWords = name.split(/\s+/).filter(Boolean);
  if (name === term) return 0;
  if (name.startsWith(`${term} `)) return 1;
  if (name === term || name.endsWith(` ${term}`) || name.includes(` ${term} `)) return 2;
  if (name.includes(term)) return 3;
  if (queryWords.every(word => nameWords.includes(word))) return 4;
  if (queryWords.every(word => nameWords.some(nameWord => nameWord.startsWith(word)))) return 5;
  // Tolera diferenças de espaçamento no cadastro, como "Dobom"/"Do Bom".
  const nameNoSpace = name.replace(/\s+/g, "");
  if (nameNoSpace.includes(term.replace(/\s+/g, "")) || queryWords.every(word => nameNoSpace.includes(word))) return 6;
  const context = normalizeProductSearch(`${product.brand} ${product.category} ${product.establishment}`);
  if (context.includes(term)) return 10;
  if (queryWords.every(word => context.includes(word))) return 11;
  if (queryWords.some(word => context.includes(word))) return 12;
  return 99;
}

function useCatalogState() {
  const [catalog, setCatalog] = useState<CatalogPayload>(() => withoutDemoEstablishments({ ...initialCatalog, metrics: verifiedDatasetMetrics }));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    // Mantém todos os estabelecimentos reais visíveis mesmo se a carga maior
    // de produtos ou preços exceder o tempo limite da conexão.
    fetchSectorCatalog()
      .then(value => { if (active) setCatalog(value); })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { catalog, loading };
}

function useCatalog() { return useCatalogState().catalog; }


function StoreLogo({ name }: { name: string }) {
  const source = getStoreLogoUrl(name);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  return source && !failed
    ? <img src={source} alt={`Logomarca de ${name}`} loading="lazy" onError={() => setFailed(true)} />
    : <Store aria-hidden="true" />;
}

function ProductVisual({ product, eager = false }: { product: Product; eager?: boolean }) {
  const source = resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  return source && !failed
    ? <img src={source} alt={product.name} width="280" height="240" loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />
    : <span className="ref-product-fallback" role="img" aria-label={`Foto de ${product.name} indisponível`}><span className="ref-product-fallback__mark"><PackageSearch aria-hidden="true" /></span><small>{product.category || "Produto local"}<em>Foto indisponível</em></small></span>;
}


/* A home antiga deste modulo (ReferenceHome + SmartBasketHome) foi
   removida: a rota "/" usa HomeNew2026 desde a reformulacao, e este
   codigo so continuava arrastando Home2026.css, HomeStoryRefinement.css
   e HomeSmartBasket.css para o CSS critico de todas as paginas. */


export function ReferenceStoresPage() {
  const catalog = useCatalog(); const [params] = useSearchParams(); const activeDirectorySector = getMarketplaceSector(params.get("setor")); const [query, setQuery] = useState(""); const [mapStore, setMapStore] = useState(""); const stores = catalog.stores.filter(store => { const matchesQuery = normalize(`${store.name} ${store.neighborhood}`).includes(normalize(query)); const matchesSector = !activeDirectorySector || groupForStore(store).id === activeDirectorySector.id; return matchesQuery && matchesSector; }); const mapLabel = mapStore || `${activeDirectorySector?.label || "Estabelecimentos"} em Feijó`; const mapSearchTerm = mapStore || activeDirectorySector?.label || "Estabelecimentos"; const mapQuery = encodeURIComponent(`${mapSearchTerm}, Feijó - AC, 69960-000, Brasil`);
  return <div className="ref-page ref-directory ref-stores-page"><PublicHeader current="stores" /><main id="conteudo-principal" className="ref-shell ref-directory__main"><section className="ref-stores-hero"><img className="ref-stores-hero__bg" src="/mercado-bairro-feijo-v1.webp" alt="" aria-hidden="true" loading="eager" width="1727" height="936" /><div className="ref-stores-hero__scrim" aria-hidden="true" /><div className="ref-stores-hero__copy"><span>{activeDirectorySector ? activeDirectorySector.eyebrow.toLocaleUpperCase("pt-BR") : "Comércio local verificado"}</span><h1>{activeDirectorySector ? activeDirectorySector.label : <>Negócios locais, mais perto.</>}</h1><p>{activeDirectorySector?.description || "Descubra estabelecimentos de Feijó, consulte catálogos e encontre onde comprar melhor."}</p></div><div className="ref-stores-hero__row"><div className="ref-stores-hero__stat"><BadgeCheck aria-hidden="true" /> {stores.length} {stores.length === 1 ? "cadastro neste setor" : "cadastros neste setor"}</div><Link className="ref-stores-hero__cta" to="/lojista">Cadastrar meu negócio <ArrowRight aria-hidden="true" /></Link></div></section><div className="ref-search-sectors"><SectorNavigator active={activeDirectorySector?.id || "all"} compact/></div><div className="ref-stores-toolbar"><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={activeDirectorySector ? `Buscar em ${activeDirectorySector.shortLabel}` : "Buscar negócio ou bairro"} aria-label="Buscar estabelecimento" /><span>{stores.length} {stores.length === 1 ? "resultado" : "resultados"}</span></div><section className="ref-stores-directory"><div className="ref-store-cards"><header><div><span>ESTABELECIMENTOS</span><h2>Comércios para explorar</h2></div><small>Catálogos e preços locais</small></header>{stores.map(store => <article className={`ref-store-card${mapStore === store.name ? " is-map-active" : ""}`} key={store.id}><button className="ref-store-card__select" type="button" onClick={() => setMapStore(store.name)} aria-label={`Mostrar ${store.name} no mapa`}><i style={{ background: store.color }}><StoreLogo name={store.name} /></i><span><small>{store.neighborhood}</small><strong>{store.name}</strong><em>{store.products} produtos no catálogo</em></span><MapPin aria-hidden="true" /></button><footer><button type="button" onClick={() => setMapStore(store.name)}><MapPin /> Localizar</button><Link to={`/estabelecimento/${store.slug}`}>Abrir catálogo <ArrowRight /></Link></footer></article>)}{!stores.length && <div className="ref-empty"><Store /><h2>Nenhum estabelecimento encontrado</h2><p>Tente buscar por outro nome ou bairro.</p></div>}</div><aside className="ref-stores-map" id="mapa-estabelecimentos"><header><MapIcon /><span><strong>{mapStore || "Mapa do comércio local"}</strong><small>{mapStore ? "Localização pesquisada em Feijó" : `Explore ${activeDirectorySector?.shortLabel.toLocaleLowerCase("pt-BR") || "negócios"} de Feijó`}</small></span></header><iframe key={mapQuery} title={`Mapa de ${mapLabel}`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">Abrir mapa completo <ArrowRight /></a></aside></section></main><PublicFooter /><AppDock current="stores" /></div>;
}

export function ReferenceFavoritesPage() { const catalog = useCatalog(); const { favoriteIds, loading, toggleFavorite } = useFavorites(); const products = catalog.products.filter(item => favoriteIds.includes(String(item.id))); return <div className="ref-page ref-directory"><PublicHeader /><main id="conteudo-principal" className="ref-shell ref-directory__main"><div className="ref-page-title"><div><span>SEUS PRODUTOS</span><h1>Favoritos para acompanhar.</h1><p>Reúna aqui os preços que você quer consultar de novo.</p></div><div className="ref-update"><Heart /><span>{favoriteIds.length} favoritos<small>sincronizados com sua conta</small></span></div></div>{loading ? <div className="ref-empty"><span className="ref-spinner" /><p>Carregando favoritos…</p></div> : products.length ? <div className="ref-product-grid">{products.map(product => <article key={product.id}><button type="button" onClick={() => void toggleFavorite(product.id)} aria-label={`Remover ${product.name}`}><X /></button><Link to={`/produto/${product.slug}`}><div><ProductVisual product={product} /></div><small>{product.category}</small><strong>{product.name}</strong><span>{product.size}</span><footer><em>a partir de</em><b>{brl.format(product.minPrice)}</b></footer></Link></article>)}</div> : <div className="ref-empty ref-empty--large"><Heart /><h2>Nenhum favorito ainda</h2><p>Salve produtos para consultar os preços mais rápido.</p><Link to="/buscar">Explorar preços <ArrowRight /></Link></div>}</main><PublicFooter /><AppDock current="profile" /></div>; }

export function ReferenceAuthPage({ mode }: { mode: "login" | "register" }) { const navigate = useNavigate(); const location = useLocation(); const { signInWithPassword, signUp: signUpAuth } = useAuth(); const redirectTo = sanitizeRedirect(new URLSearchParams(location.search).get("redirect")); const [accountType, setAccountType] = useState<"consumer" | "merchant">("consumer"); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setBusy(true); setMessage(""); const data = new FormData(event.currentTarget); const email = String(data.get("email") || "").trim(); const password = String(data.get("password") || ""); const result = mode === "login" ? await signInWithPassword(email, password) : await signUpAuth(email, password, String(data.get("name") || "").trim()); setBusy(false); if (result.error) { setMessage(result.error); return; } if (mode === "register") { setMessage("Cadastro criado. Se pedirmos confirmação, verifique seu e-mail."); } navigate(redirectTo !== "/" ? redirectTo : accountType === "merchant" ? "/painel-lojista" : "/", { replace: true }); }; const recover = async () => { const email = prompt("Digite seu e-mail para recuperar a senha:")?.trim(); if (!email) return; const result = await requestPasswordReset(email); setMessage(result.error || "Enviamos as instruções para o seu e-mail."); }; return <div className="ref-auth"><aside className="ref-auth__story"><Brand inverse /><div className="ref-auth__hero-copy"><span className="ref-kicker"><MapPin /> FEIJÓ, ACRE</span><h1>Escolhas melhores começam por aqui.</h1><p>Compare preços locais com clareza e compre com mais confiança.</p></div><small>PreçoCerto · Economia perto de você</small></aside><main className="ref-auth__form"><Link className="ref-auth__back" to="/"><ArrowLeft /> Voltar ao PreçoCerto</Link><div className="ref-auth__card"><span className="ref-auth__eyebrow">{mode === "login" ? "BEM-VINDO DE VOLTA" : "COMECE AGORA"}</span><h2>{mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}</h2><p>{mode === "login" ? "Acesse preços, favoritos e seus últimos comparativos." : "Escolha como você quer usar o PreçoCerto."}</p><div className="ref-account-tabs"><button type="button" className={accountType === "consumer" ? "is-active" : ""} onClick={() => setAccountType("consumer")}><UserRound /> Consumidor<small>Quero comparar preços</small></button><button type="button" className={accountType === "merchant" ? "is-active" : ""} onClick={() => setAccountType("merchant")}><Store /> Comerciante<small>Quero divulgar ofertas</small></button></div><form onSubmit={submit}>{mode === "register" && <label>Nome completo<input name="name" required autoComplete="name" /></label>}<label>E-mail<input name="email" type="email" required autoComplete="email" /></label><label>Senha<input name="password" type="password" minLength={6} required autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>{message && <p className="ref-auth__message" role="status">{message}</p>}<button className="ref-auth__submit" type="submit" disabled={busy}>{busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar minha conta"}<ArrowRight /></button></form>{mode === "login" && <button type="button" className="ref-auth__recover" onClick={recover}>Esqueci minha senha</button>}<div className="ref-auth__switch"><span>{mode === "login" ? "Ainda não tem conta?" : "Já possui uma conta?"}</span><Link to={mode === "login" ? "/cadastro" : "/login"}>{mode === "login" ? "Criar conta" : "Entrar"}</Link></div><p className="ref-auth__safe"><LockKeyhole /> Seus dados estão protegidos.</p></div></main><AppDock current="profile" /></div>; }

export function ReferenceMerchantDashboard() { const catalog = useCatalog(); const rows = catalog.products.slice(0, 6); return <div className="ref-admin ref-merchant-admin"><aside className="ref-admin__sidebar"><Brand inverse /><nav><span>GESTÃO</span><Link className="is-active" to="/painel-lojista"><LayoutDashboard /> Visão geral</Link><Link to="/painel-lojista/catalogo"><PackageSearch /> Catálogo</Link><Link to="/painel-lojista/vendas-online"><ShoppingBasket /> Pedidos</Link><span>NEGÓCIO</span><Link to="/painel-lojista/configurar-negocio"><Store /> Minha loja</Link><Link to="/estabelecimentos"><Eye /> Ver no site</Link></nav><small>PreçoCerto · Feijó, Acre</small></aside><main id="conteudo-principal" className="ref-admin__main"><header><div><span>PAINEL DO COMERCIANTE</span><h1>Central Super</h1><p>Preços, estoque e visibilidade do seu catálogo.</p></div><div><ThemeButton /><Link to="/">Ver site</Link></div></header><section className="ref-admin__cards"><article><Tag /><span>Produtos publicados</span><strong>{rows.length}</strong><small>catálogo ativo</small></article><article><BadgeCheck /><span>Preços atualizados</span><strong>92%</strong><small>nas últimas 24 horas</small></article><article><Eye /><span>Visualizações</span><strong>1.284</strong><small>nesta semana</small></article><article><TrendingDown /><span>Melhores preços</span><strong>4</strong><small>liderando comparações</small></article></section><section className="ref-merchant-table"><header><div><span>CATÁLOGO</span><h2>Preços e estoque</h2></div><button type="button"><Plus /> Novo produto</button></header><div className="ref-results-table"><div className="ref-results-table__head"><span>Produto</span><span>Status</span><span>Mercado local</span><span>Seu preço</span><span /></div>{rows.map(product => <div className="ref-result-row" key={product.id}><span className="ref-result-product"><i><ProductVisual product={product} /></i><span><small>{product.category}</small><strong>{product.name}</strong><em>{product.size}</em></span></span><span className="ref-status"><Check /> publicado</span><span className="ref-result-range">{brl.format(product.minPrice)} — {brl.format(product.maxPrice)}<small>{product.storeCount} lojas</small></span><strong className="ref-result-price">{brl.format(product.minPrice)}</strong><button type="button" aria-label={`Editar ${product.name}`}>Editar</button></div>)}</div></section></main></div>; }

type InfoKind = "collaborate" | "contact" | "pharmacies" | "orders" | "culture";
const infoCopy: Record<InfoKind, { eyebrow: string; title: string; copy: string; action: string; to: string }> = { collaborate: { eyebrow: "COLABORE COM FEIJÓ", title: "Ajude a manter os preços úteis.", copy: "Compartilhe atualizações e fortaleça uma base local mais transparente para todos.", action: "Entrar para colaborar", to: "/login" }, contact: { eyebrow: "FALE COM O PREÇOCERTO", title: "Estamos perto para ouvir.", copy: "Envie sua dúvida, sugestão ou proposta de parceria com o comércio local.", action: "Acessar minha conta", to: "/login" }, pharmacies: { eyebrow: "SAÚDE LOCAL", title: "Farmácias de Feijó.", copy: "A cobertura de preços de farmácias está sendo organizada com verificação e responsabilidade.", action: "Ver estabelecimentos", to: "/estabelecimentos" }, orders: { eyebrow: "SUAS COMPRAS", title: "Pedidos em um só lugar.", copy: "Entre para acompanhar pagamentos, preparo e entrega dos pedidos feitos nas lojas participantes.", action: "Entrar para continuar", to: "/login" }, culture: { eyebrow: "CULTURA DE FEIJÓ", title: "Talento local também tem valor.", copy: "Descubra projetos, livros e produções da nossa cidade dentro do ecossistema PreçoCerto.", action: "Explorar estabelecimentos", to: "/estabelecimentos" } };


function CollaborationPage() {
  const { userId } = useFavorites();
  const [form, setForm] = useState({ name: "", city: "", establishment: "", address: "", email: "", whatsapp: "" });
  const [touched, setTouched] = useState(false);
  const [needsAccount, setNeedsAccount] = useState(false);
  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (event: { target: { value: string } }) => setForm(current => ({ ...current, [key]: event.target.value })),
  });
  const required: (keyof typeof form)[] = ["name", "city", "establishment", "email"];
  const missing = required.filter(key => !form[key].trim());
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneDigits = form.whatsapp.replace(/\D/g, "");
  const emailFormatOk = EMAIL_RE.test(form.email.trim());
  const phoneFormatOk = !form.whatsapp.trim() || (phoneDigits.length >= 10 && phoneDigits.length <= 11);
  const emailError = touched && form.email.trim() !== "" && !emailFormatOk;
  const phoneError = touched && form.whatsapp.trim() !== "" && !phoneFormatOk;
  const isValid = missing.length === 0 && emailFormatOk && phoneFormatOk;

  const emailSubject = encodeURIComponent("Colaboração de preços — nota de compra");
  const emailBody = encodeURIComponent(
    `Olá, equipe PreçoCerto!\n\nEstou enviando uma foto legível da minha nota de compra para análise e possível atualização dos preços.\n\nNome: ${form.name}\nCidade de onde estou enviando: ${form.city}\nEstabelecimento: ${form.establishment}\nEndereço do estabelecimento: ${form.address || "não informado"}\nE-mail de contato: ${form.email}\nWhatsApp: ${form.whatsapp || "não informado"}\n\nVou anexar a imagem da nota neste e-mail.`
  );
  const emailHref = `mailto:precocerto-fj@proton.me?subject=${emailSubject}&body=${emailBody}`;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!isValid) return;
    if (!userId) { setNeedsAccount(true); return; }
    window.location.href = emailHref;
  };

  return <div className="ref-page pc-collab-page pc-noheader-page">
    <MinimalTopBar variant="light" />
    <main id="conteudo-principal" className="pc-collab">
      <div className="pc-collab__left">
        <div className="pc-collab__copy">
          <span className="pc-collab__eyebrow"><UsersRound aria-hidden="true" /> COLABORAÇÃO VERIFICADA</span>
          <h1 id="pc-collab-title">Viu um preço diferente?</h1>
          <p>Preencha seus dados e envie uma foto legível da nota. Nossa equipe confere e atualiza o catálogo.</p>
          <div className="pc-collab__trust">
            <span><ShieldCheck aria-hidden="true" /> Análise antes da publicação</span>
            <span><BadgeCheck aria-hidden="true" /> Sem alteração automática</span>
            <span><Mail aria-hidden="true" /> Resposta em até 2 dias úteis</span>
          </div>
        </div>

        <section className="pc-collab__panel" aria-label="Enviar nota de compra">
        {needsAccount ? (
          <div className="pc-collab__gate">
            <span className="pc-collab__gate-icon"><LockKeyhole aria-hidden="true" /></span>
            <h2>Crie sua conta para enviar</h2>
            <p>Para enviar notas de compra é preciso estar cadastrado e logado, assim a equipe consegue confirmar informações quando necessário. Seus dados preenchidos são mantidos ao voltar.</p>
            <div className="pc-collab__gate-actions">
              <Link className="pc-collab__gate-primary" to="/cadastro?redirect=%2Fcolaborar">Criar conta grátis <ArrowRight aria-hidden="true" /></Link>
              <Link className="pc-collab__gate-login" to="/login?redirect=%2Fcolaborar">Já tenho conta</Link>
            </div>
            <button type="button" className="pc-collab__gate-back" onClick={() => setNeedsAccount(false)}>Voltar ao formulário</button>
          </div>
        ) : <>
          <header><span><ReceiptText aria-hidden="true" /></span><div><small>SUA CONTRIBUIÇÃO</small><h2>Envie a nota por e-mail</h2></div></header>
          <form className="pc-collab__form" onSubmit={submit} noValidate>
            <div className="pc-collab__row">
              <label>Seu nome <em>*</em><input {...field("name")} type="text" autoComplete="name" placeholder="Como podemos te chamar" /></label>
              <label>Cidade de onde vai enviar <em>*</em><input {...field("city")} type="text" autoComplete="address-level2" placeholder="Ex.: Feijó, Acre" /></label>
            </div>
            <div className="pc-collab__row">
              <label>Estabelecimento <em>*</em><input {...field("establishment")} type="text" placeholder="Nome da loja da nota" /></label>
              <label>Endereço do estabelecimento<input {...field("address")} type="text" placeholder="Rua, bairro (se souber)" /></label>
            </div>
            <div className="pc-collab__row">
              <label>Seu e-mail <em>*</em>
                <input {...field("email")} type="email" autoComplete="email" placeholder="para retorno, se precisar" aria-invalid={emailError} />
                {emailError && <small className="pc-collab__field-error">E-mail inválido, confira o formato.</small>}
              </label>
              <label>Seu WhatsApp
                <input {...field("whatsapp")} type="tel" autoComplete="tel" placeholder="(68) 9####-####" aria-invalid={phoneError} />
                {phoneError && <small className="pc-collab__field-error">Número inválido, use DDD + celular.</small>}
              </label>
            </div>
            {touched && missing.length > 0 && <p className="pc-collab__error"><Info aria-hidden="true" /> Preencha nome, cidade, estabelecimento e e-mail para continuar.</p>}
            <button className="pc-collab__send" type="submit"><Camera aria-hidden="true" /> Preparar envio da nota <ArrowRight aria-hidden="true" /></button>
            <small className="pc-collab__hint">É preciso estar cadastrado e logado para enviar. Seu app de e-mail abrirá com os dados preenchidos. Anexe a foto da nota antes de enviar.</small>
          </form>
        </>}
        </section>
      </div>

      <div className="pc-collab__media" aria-hidden="true">
        <img src={collabHeroImg} alt="" width="1280" height="853" loading="eager" decoding="async" />
      </div>
    </main>
    <PublicFooter />
  </div>;
}

function ContactPage() {
  return <div className="pc-contact-page pc-noheader-page">
    <MinimalTopBar variant="light" />
    <main id="conteudo-principal" className="pc-contact">
      <div className="pc-contact__left">
        <div className="pc-contact__copy">
          <span className="pc-contact__eyebrow"><Mail aria-hidden="true" /> FALE COM O PREÇOCERTO</span>
          <h1>Estamos perto para ouvir.</h1>
          <p>Dúvida, sugestão ou proposta de parceria com o comércio local. Escolha o canal mais rápido para você.</p>
        </div>

        <div className="pc-contact__grid" aria-label="Canais de contato">
          <a className="pc-contact__card" href="mailto:precocerto-fj@proton.me">
            <span className="pc-contact__icon"><Mail aria-hidden="true" /></span>
            <div><small>E-MAIL</small><strong>precocerto-fj@proton.me</strong><p>Resposta em até 2 dias úteis.</p></div>
            <ArrowRight aria-hidden="true" />
          </a>
          <a className="pc-contact__card" href="https://wa.me/5568992031340" target="_blank" rel="noreferrer">
            <span className="pc-contact__icon"><MessageCircle aria-hidden="true" /></span>
            <div><small>WHATSAPP</small><strong>(68) 99203-1340</strong><p>Atendimento rápido em horário comercial.</p></div>
            <ArrowRight aria-hidden="true" />
          </a>
        </div>

        <div className="pc-contact__links" aria-label="Outros motivos comuns de contato">
          <Link className="pc-contact__link" to="/colaborar">
            <span><ReceiptText aria-hidden="true" /></span>
            <strong>Viu um preço diferente?</strong>
          </Link>
          <Link className="pc-contact__link" to="/login?redirect=%2Fpainel-lojista">
            <span><Store aria-hidden="true" /></span>
            <strong>Já tenho um estabelecimento</strong>
          </Link>
          <Link className="pc-contact__link" to="/lojista">
            <span><UsersRound aria-hidden="true" /></span>
            <strong>Quero cadastrar minha loja</strong>
          </Link>
        </div>
      </div>

      <div className="pc-contact__media" aria-hidden="true">
        <img src={contactHeroImg} alt="" width="1280" height="853" loading="eager" decoding="async" />
      </div>
    </main>
    <PublicFooter />
  </div>;
}

export function ReferenceInfoPage({ kind }: { kind: InfoKind }) { if (kind === "collaborate") return <CollaborationPage />; if (kind === "contact") return <ContactPage />; const content = infoCopy[kind]; return <div className="ref-page"><PublicHeader /><main id="conteudo-principal" className="ref-info"><span>{content.eyebrow}</span><h1>{content.title}</h1><p>{content.copy}</p><Link to={content.to}>{content.action} <ArrowRight /></Link></main><PublicFooter /></div>; }
export function ReferenceNotFound() {
  // Rotas inexistentes mantinham o título/robots da página anterior (SPA).
  useEffect(() => {
    document.title = "Página não encontrada | PreçoCerto";
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
  }, []);
  return <div className="ref-page"><PublicHeader /><main id="conteudo-principal" className="ref-info"><span>PÁGINA NÃO ENCONTRADA</span><h1>Vamos voltar ao preço certo.</h1><p>Este endereço não existe ou foi reorganizado na nova experiência.</p><Link to="/">Ir para a homepage <ArrowRight /></Link></main><PublicFooter /></div>;
}
