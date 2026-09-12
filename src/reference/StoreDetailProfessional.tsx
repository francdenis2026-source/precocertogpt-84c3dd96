import marketsHeroPhoto from "../assets/sectors-2026/sector-markets-v3.jpg";
import butchersHeroPhoto from "../assets/sectors-2026/sector-butchers-v3.jpg";
import bakeryHeroPhoto from "../assets/sectors-2026/sector-bakery-v3.jpg";
import foodHeroPhoto from "../assets/sectors-2026/sector-food-v3.jpg";
import pharmacyHeroPhoto from "../assets/sectors-2026/sector-pharmacies-v3.jpg";
import booksHeroPhoto from "../assets/sectors-2026/sector-books-v3.jpg";
import servicesHeroPhoto from "../assets/sectors-2026/sector-services-v3.jpg";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP, gsap, ScrollTrigger } from "../lib/lightMotion";
import { Link, useLocation, useParams } from "react-router-dom";
import { AlertTriangle, ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Clock3, Heart, Home, Info, LockKeyhole, MapPin, MessageCircle, PackageSearch, Search, ShieldCheck, SlidersHorizontal, Sparkles, Store, Tag, UserPlus } from "lucide-react";
import { fetchCatalog } from "../data/remoteCatalog";
import type { CatalogPayload, Product } from "../data/catalog";
import { resolveProductImage } from "../data/productImageResolver";
import { getStoreLogoUrl } from "../data/storeLogos";
import { groupForStore } from "../data/businessTaxonomy";
import { marketplaceSectors } from "./MarketplaceSectors";
import { MinimalTopBar } from "./PublicChrome";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import { useStoreFavorites } from "../features/favorites/StoreFavoritesProvider";
import { usePriceVisibility } from "../hooks/usePriceVisibility";
import { ProductCardActions } from "../components/catalog/ProductCardActions";
import { formatProductSpec, humanizeCategory, properCaseIfShouting, whatsappHref } from "./storeDisplayFormat";
import "./StoreDetailProfessional.css";
import "./StoreExperienceAcai2026.css";
import "./StoreSectorHero.css";

gsap.registerPlugin(ScrollTrigger);

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const FREE_PREVIEW_LIMIT = 4;
const PAGE_SIZE = 20;


// "/supermercado-hero.jpg" e "/hero-feijo-mercado-claro-2026.webp" saíram da
// rotação: não são fotografias profissionais consistentes com as demais e
// faziam lojas vizinhas (hash próximo) repetirem a mesma imagem destoante.
const STORE_BACKDROPS = [marketsHeroPhoto];

// Escolha estavel: a mesma loja recebe sempre a mesma imagem, e lojas
// diferentes tendem a receber imagens diferentes.
function storeBackdrop(key: string) {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  return STORE_BACKDROPS[hash % STORE_BACKDROPS.length];
}

// Cada setor recebe um hero próprio: mercados mantêm a fotografia real do
// comércio, e os demais (farmácia, padaria, cultura, serviços) — sem fotos
// próprias no acervo — ganham um cartão com a cor e o ícone do setor, para
// não repetir uma imagem de supermercado num perfil que não é um mercado.
// A categoria do estabelecimento vem da taxonomia única (businessTaxonomy):
// ela junta o tipo gravado no cadastro com o que o próprio nome revela
// ("Açougue do João", "Panificadora Central"). Antes, qualquer tipo não
// reconhecido virava "mercado" por padrão — e era por isso que açougue,
// padaria e lanchonete apareciam com a foto e o rótulo de supermercado.
const marketSectorId = "markets";
function sectorForStore(store: { kind?: string | null; name?: string | null }) {
  const group = groupForStore(store);
  return marketplaceSectors.find(sector => sector.id === group.id) || marketplaceSectors[0];
}

// Um hero por setor, adequado ao tipo de comércio: fotografia real, sem
// texto embutido, uma por setor.
//
// Os arquivos apontados aqui nunca existiram no repositório (404 silencioso
// — o navegador só descartava a imagem e mostrava a cor sólida de fundo por
// baixo). Além disso açougue e lanchonete não tinham entrada nenhuma neste
// mapa, então caíam sem nenhum hero.
const SECTOR_BACKDROPS: Record<string, string> = {
  pharmacies: pharmacyHeroPhoto,
  bakery: bakeryHeroPhoto,
  books: booksHeroPhoto,
  services: servicesHeroPhoto,
  butchers: butchersHeroPhoto,
  food: foodHeroPhoto,
};

const SECTOR_TAGLINES: Record<string, string> = {
  markets: "Consulte produtos, marcas e preços organizados para comparar antes de comprar.",
  butchers: "Cortes, carnes e pescados deste açougue, com o preço à vista antes de você ir até lá.",
  pharmacies: "Medicamentos, higiene e cuidados pessoais organizados por este estabelecimento de saúde.",
  bakery: "Pães, bolos, salgados e doces desta casa, organizados para consulta antes de ir até lá.",
  food: "Cardápio completo com preço aberto, para escolher o pedido antes de chamar no WhatsApp.",
  books: "Obras, autoria e projeto cultural deste perfil, sem mistura com catálogo de supermercado.",
  services: "Especialidade, contato e área de atendimento deste prestador de serviço local.",
  other: "Produtos e informações deste comércio local, organizados para consulta.",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function cleanBrand(value?: string | null) {
  const brand = (value || "").trim();
  if (!brand || brand === "-" || brand === "—" || normalize(brand) === "nao identificada") return "Marca não informada";
  return brand;
}

function ProductImage({ product }: { product: Product }) {
  const source = resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  if (source && !failed) return <img src={source} alt={product.name} width="200" height="160" loading="lazy" onError={() => setFailed(true)} />;
  return <span className="store-pro-fallback" role="img" aria-label={`Foto de ${product.name} indisponível`}><PackageSearch aria-hidden="true" /><small>Foto indisponível</small></span>;
}

export function StoreDetailProfessional() {
  const { identifier = "" } = useParams();
  const location = useLocation();
  const { userId } = useFavorites();
  const { isStoreFavorite, toggleStoreFavorite } = useStoreFavorites();
  const { allPricesVisible } = usePriceVisibility();
  const isGuest = !userId && !allPricesVisible;
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState<"name" | "price-asc" | "price-desc">("name");
  const [page, setPage] = useState(1);
  const [logoFailed, setLogoFailed] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Entrada suave da hero e revelação dos blocos abaixo dela ao rolar.
  // O catálogo carrega de forma assíncrona, então a dependência em
  // `loading` garante que a animação só rode depois que a hero de verdade
  // existe no DOM (na primeira renderização, com loading=true, a página
  // mostra só o spinner). Sem essa dependência o useGSAP rodaria uma vez no
  // mount, antes do conteúdo aparecer, e nunca animaria nada.
  useGSAP(() => {
    if (loading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".store-pro-logo, .store-pro-copy > *", { y: 18, opacity: 0, duration: .6, stagger: .06, ease: "power3.out" });
    gsap.utils.toArray<HTMLElement>(".store-pro-notice, .store-pro-summary").forEach((el, index) => {
      gsap.from(el, { y: 14, opacity: 0, duration: .5, delay: .1 + index * .05, ease: "power2.out" });
    });
    gsap.from(".store-pro-catalog", { scrollTrigger: { trigger: ".store-pro-catalog", start: "top 88%", once: true }, y: 22, opacity: 0, duration: .55, ease: "power2.out" });
  }, { scope: pageRef, dependencies: [loading] });

  useEffect(() => {
    let active = true;
    // Reaproveita o catálogo já em cache (60s) sempre que possível — a Home,
    // a busca e os favoritos já carregam esse mesmo catálogo antes do
    // usuário chegar aqui, então forçar uma nova consulta completa ao banco
    // a cada clique em um estabelecimento é o que fazia esta página demorar
    // e mostrar "Carregando…" por vários segundos sem necessidade.
    fetchCatalog()
      .then(data => { if (active) setCatalog(data); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  /* Resolve por id, pelo slug publicado e tambem pelo slug derivado do nome:
     enderecos antigos, montados a partir do nome antes de o app passar a usar
     a coluna `slug`, continuam abrindo a loja certa em vez de cair no 404. */
  const store = useMemo(() => {
    const wanted = identifier.trim().toLowerCase();
    if (!wanted) return undefined;
    const fromName = (value: string) => value
      .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return catalog?.stores.find(item =>
      String(item.id).toLowerCase() === wanted
      || (item.slug || "").toLowerCase() === wanted
      || fromName(item.name || "") === wanted);
  }, [catalog, identifier]);

  // Assim como no produto, SeoRouteManager cai num título genérico
  // ("Estabelecimento | PreçoCerto") para /estabelecimento/:id — aqui
  // sobrescrevemos com o nome real assim que o catálogo carrega.
  useEffect(() => {
    if (!store) return;
    const title = `${store.name} | PreçoCerto`;
    const description = `Catálogo e preços de ${store.name}${store.neighborhood ? ` (${store.neighborhood})` : ""} em Feijó (AC), para comparar antes de comprar.`;
    document.title = title;
    const setMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
  }, [store]);

  const allProducts = useMemo(() => {
    if (!catalog || !store) return [];
    return catalog.products.filter(item => item.offers?.some(offer => String(offer.establishmentId) === String(store.id)) || String(item.establishmentId) === String(store.id));
  }, [catalog, store]);

  // Data da coleta de preço mais recente entre os produtos da loja — o que
  // realmente responde "quando isso foi conferido", em vez do selo genérico
  // "catálogo verificado" sem nenhuma data por trás.
  const lastUpdatedLabel = useMemo(() => {
    const stamps = allProducts.map(product => product.capturedAt).filter(Boolean) as string[];
    const latest = stamps.length ? stamps.reduce((max, value) => value > max ? value : max) : catalog?.updatedAt;
    const date = latest ? new Date(latest) : null;
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : null;
  }, [allProducts, catalog]);

  const specialties = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of allProducts) {
      const label = (product.category || "").trim();
      if (label) counts.set(label, (counts.get(label) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [allProducts]);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(allProducts.map(product => product.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"))], [allProducts]);

  // Um mercado que também tem açougue interno aparece no diretório de
  // Açougues (ver sectorCatalog.ts), mas o link de lá levava ao catálogo
  // inteiro da loja — misturando carnes com todo o resto. Quem chega por
  // ?categoria=<slug> já cai com o filtro de categoria aplicado, vendo só a
  // vitrine daquele nicho, como se fosse um açougue à parte.
  useEffect(() => {
    const wanted = new URLSearchParams(location.search).get("categoria");
    if (!wanted) return;
    const match = categories.find(item => item.toLowerCase() === wanted.toLowerCase());
    if (match) setCategory(match);
  }, [location.search, categories]);

  const filteredProducts = useMemo(() => {
    const term = normalize(query);
    const filtered = allProducts.filter(product => {
      const matchesCategory = category === "Todos" || product.category === category;
      const matchesQuery = !term || normalize(`${product.name} ${product.brand || ""} ${product.category || ""} ${product.size || ""}`).includes(term);
      return matchesCategory && matchesQuery;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.minPrice - b.minPrice || a.name.localeCompare(b.name, "pt-BR");
      if (sort === "price-desc") return b.minPrice - a.minPrice || a.name.localeCompare(b.name, "pt-BR");
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [allProducts, query, category, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleProducts = useMemo(() => filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filteredProducts, safePage]);
  useEffect(() => setPage(1), [query, category, sort]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  const shownProducts = isGuest ? visibleProducts.slice(0, FREE_PREVIEW_LIMIT) : visibleProducts;
  const teaserProducts = isGuest ? visibleProducts.slice(FREE_PREVIEW_LIMIT, FREE_PREVIEW_LIMIT + 4) : [];
  const lockedTotal = isGuest ? Math.max(0, filteredProducts.length - FREE_PREVIEW_LIMIT) : 0;
  const signupHref = `/cadastro?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`;
  const loginHref = `/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`;

  // Enquanto o catálogo carrega (raro agora que a página reaproveita o
  // cache, mas ainda acontece na primeira visita ao site), mostra um
  // esqueleto com a mesma "forma" da página real sobre um fundo com a
  // identidade visual da marca, em vez de uma tela em branco com spinner —
  // assim a transição parece parte do design, não uma falha de carregamento.
  if (loading) return (
    <main className="store-pro-skeleton" role="status" aria-live="polite">
      <span className="store-pro-skeleton__sr">Carregando estabelecimento…</span>
      <div className="store-pro-skeleton__hero">
        <span className="store-pro-skeleton__logo" />
        <div className="store-pro-skeleton__lines">
          <span className="store-pro-skeleton__bar store-pro-skeleton__bar--kicker" />
          <span className="store-pro-skeleton__bar store-pro-skeleton__bar--title" />
          <span className="store-pro-skeleton__bar store-pro-skeleton__bar--text" />
        </div>
      </div>
      <div className="store-pro-skeleton__grid">
        {Array.from({ length: 8 }).map((_, index) => <span className="store-pro-skeleton__card" key={index} />)}
      </div>
    </main>
  );
  if (!store || !catalog) return <div className="ref-page store-pro-page pc-noheader-page">
    <MinimalTopBar variant="light" />
    <main className="store-pro-state">
      <Store aria-hidden="true" />
      <h1>Estabelecimento não encontrado</h1>
      <p>Este endereço não corresponde a uma loja ativa no catálogo.</p>
      <div className="store-pro-state__actions">
        <Link to="/estabelecimentos"><Home aria-hidden="true" /> Voltar aos estabelecimentos</Link>
        <Link to="/buscar" className="store-pro-state__ghost"><Search aria-hidden="true" /> Buscar produtos e lojas</Link>
      </div>
    </main>
  </div>;

  const startResult = filteredProducts.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const endResult = Math.min(safePage * PAGE_SIZE, filteredProducts.length);
  const logoUrl = getStoreLogoUrl(store.name);
  const isBonsAmigos = normalize(store.name).includes("bons amigos");
  const sector = sectorForStore(store);
  const isMarketSector = sector.id === marketSectorId;
  const backdrop = isMarketSector ? storeBackdrop(store.slug || String(store.id)) : SECTOR_BACKDROPS[sector.id];
  const showLogo = logoUrl && !logoFailed;
  const SectorIcon = sector.icon;
  // Todos os estabelecimentos são de Feijó-AC, CEP 69960-000: incluir isso
  // sempre na busca do mapa evita que o Google Maps resolva o nome da loja
  // para outro lugar do Brasil (ou não encontre nada) quando o nome sozinho
  // é ambíguo ou pouco conhecido fora da cidade.
  // O endereço cadastrado, quando existe, é mais preciso que nome + bairro
  // para o Google Maps resolver o lugar certo em nomes ambíguos.
  const mapsQuery = encodeURIComponent(store.address
    ? `${store.address}, Feijó - AC, 69960-000, Brasil`
    : `${store.name}, ${store.neighborhood && store.neighborhood !== "—" ? `${store.neighborhood}, ` : ""}Feijó - AC, 69960-000, Brasil`);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const hasWhatsapp = Boolean(store.whatsapp && store.whatsapp.replace(/\D/g, "").length >= 10);
  const displayName = properCaseIfShouting(store.name);

  return <div className={`ref-page store-pro-page pc-noheader-page${isBonsAmigos ? " store-pro-page--bons-amigos" : ""}`} ref={pageRef}>
    <MinimalTopBar variant="light" />
    <main id="conteudo-principal" className="store-pro-shell">
      <div className="store-pro-topline store-pro-topline--location-only">
        <a href={mapsHref} target="_blank" rel="noreferrer"><MapPin aria-hidden="true" /> {store.address ? `${store.address} · Acre · CEP 69960-000` : `${store.neighborhood && store.neighborhood !== "—" ? `${store.neighborhood}, ` : ""}Feijó · Acre · CEP 69960-000`}</a>
      </div>

      {/* Contato direto: endereço, WhatsApp e horário existem no cadastro mas
          não apareciam em nenhum lugar do perfil (só nos cards da listagem).
          Fica visível também no mobile, ao contrário da linha de topo acima
          (escondida em telas estreitas). */}
      {(store.address || hasWhatsapp || store.openingHours) && <section className="store-pro-contact" aria-label="Contato e localização do estabelecimento">
        {store.address && <a href={mapsHref} target="_blank" rel="noreferrer" className="store-pro-contact__item"><MapPin aria-hidden="true" /><span><b>Endereço</b>{store.address}</span></a>}
        {store.openingHours && <span className="store-pro-contact__item"><Clock3 aria-hidden="true" /><span><b>Horário</b>{store.openingHours}</span></span>}
        {hasWhatsapp && <a href={whatsappHref(store.whatsapp as string, `Olá! Vi o catálogo de ${store.name} no PreçoCerto e queria falar sobre um produto.`)} target="_blank" rel="noreferrer" className="store-pro-contact__item store-pro-contact__whatsapp"><MessageCircle aria-hidden="true" /><span><b>WhatsApp</b>Falar com a loja</span></a>}
      </section>}

      <section
        className={`store-pro-hero${isBonsAmigos ? " store-pro-hero--bons-amigos" : ""}${isMarketSector ? "" : ` store-pro-hero--sector store-pro-hero--${sector.id}`}`}
        aria-labelledby="store-title"
        style={backdrop && sector.id !== "pharmacies" ? { backgroundImage: `url('${backdrop}')` } : undefined}
      >
        {sector.id !== "pharmacies" && <div className="store-pro-hero__overlay" />}
        {/* Havia aqui uma arte exclusiva do Bons Amigos apontando para
            /branding/bons-amigos-hero.jpg, que nunca existiu no repositorio: a
            loja abria com uma imagem quebrada e sem o fundo do setor, porque a
            excecao tambem desligava o backdrop. Agora a loja usa o mesmo hero
            das outras; as classes de marca continuam disponiveis para estilo. */}
        {!isMarketSector && sector.id !== "pharmacies" && <SectorIcon className="store-pro-hero__watermark" aria-hidden="true" />}
        <div className="store-pro-hero__content">
          <div className={`store-pro-logo${showLogo ? " has-image" : ""}`} style={!showLogo ? { background: store.color } : undefined}>
            {showLogo
              ? <img src={logoUrl} alt={`Logomarca ${store.name}`} width="92" height="92" onError={() => setLogoFailed(true)} />
              : <Store />}
          </div>
          <div className="store-pro-copy">
            <span><SectorIcon aria-hidden="true" /> {sector.shortLabel.toLocaleUpperCase("pt-BR")} · FEIJÓ, ACRE</span>
            <h1 id="store-title">{displayName}</h1>
            {specialties.length > 0 && <ul className="store-pro-specialties" aria-label="Especialidades do estabelecimento">
              {specialties.map(([label, count]) => <li key={label}>{humanizeCategory(label)}<b>{count}</b></li>)}
            </ul>}
            <p>{SECTOR_TAGLINES[sector.id] || SECTOR_TAGLINES[marketSectorId]}</p>
            <div className="store-pro-meta-line">
              <b><BadgeCheck aria-hidden="true" /> {allProducts.length || store.products} produtos no catálogo</b>
              <b><Clock3 aria-hidden="true" /> Informações organizadas pelo PreçoCerto</b>
            </div>
          </div>
          <div className="store-pro-status"><BadgeCheck aria-hidden="true" /><span><strong>Catálogo verificado</strong><small>{lastUpdatedLabel ? `Atualizado em ${lastUpdatedLabel}` : "Dados locais organizados"}</small></span></div>
          <button
            type="button"
            className={`store-pro-favorite${isStoreFavorite(store.id) ? " is-active" : ""}`}
            onClick={() => void toggleStoreFavorite(store.id, `${location.pathname}${location.search}`)}
            aria-pressed={isStoreFavorite(store.id)}
            aria-label={isStoreFavorite(store.id) ? `Remover ${store.name} dos favoritos` : `Favoritar ${store.name}`}
          >
            <Heart aria-hidden="true" fill={isStoreFavorite(store.id) ? "currentColor" : "none"} />
            <span>{isStoreFavorite(store.id) ? "Favoritada" : "Favoritar loja"}</span>
          </button>
        </div>
        {sector.id === "pharmacies" && <figure className="store-pro-pharmacy-photo">
          <img src={pharmacyHeroPhoto} alt="" width="1280" height="720" fetchPriority="high" />
        </figure>}
      </section>

      <div className="store-pro-notice"><Info aria-hidden="true" /><span><strong>Catálogo informativo</strong><small>O PreçoCerto exibe informações de produtos e preços. Este espaço ainda não representa venda direta ou canal oficial do estabelecimento.</small></span></div>

      {sector.id === "pharmacies" && <div className="store-pro-notice store-pro-notice--warning"><AlertTriangle aria-hidden="true" /><span><strong>Aviso sanitário</strong><small>Preços e disponibilidade são informativos. Medicamentos exigem orientação farmacêutica e, quando indicado por lei, apresentação de receita — consulte a farmácia antes de comprar.</small></span></div>}

      <section className="store-pro-summary" aria-label="Resumo do estabelecimento">
        <article><strong>{allProducts.length}</strong><span>produtos encontrados</span></article>
        <article><strong>{Math.max(1, categories.length - 1)}</strong><span>categorias disponíveis</span></article>
        <article><ShieldCheck /><span><b>Compare com clareza</b><small>Marca, embalagem e preço visíveis</small></span></article>
      </section>

      <section className="store-pro-catalog" aria-labelledby="store-catalog-title">
        <header className="store-pro-catalog-head">
          <div><span>CATÁLOGO</span><h2 id="store-catalog-title">Produtos deste estabelecimento</h2><p>{filteredProducts.length} {filteredProducts.length === 1 ? "resultado" : "resultados"}{query || category !== "Todos" ? " com os filtros atuais" : " disponíveis"}</p></div>
          <span className="store-pro-catalog-hint"><Search /> Pesquise por nome, marca ou categoria</span>
        </header>

        <div className="store-pro-toolbar">
          <label className="store-pro-search"><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex.: refresco, Brassuk, leite em pó…" aria-label="Buscar no catálogo do estabelecimento" /></label>
          <label className="store-pro-select"><SlidersHorizontal /><select value={category} onChange={event => setCategory(event.target.value)} aria-label="Filtrar por categoria">{categories.map(item => <option key={item} value={item}>{item === "Todos" ? item : humanizeCategory(item)}</option>)}</select></label>
          <label className="store-pro-select"><select value={sort} onChange={event => setSort(event.target.value as typeof sort)} aria-label="Ordenar produtos"><option value="name">Ordenar: A-Z</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></select></label>
        </div>

        {visibleProducts.length ? <div className="ref-product-grid store-pro-grid">
          {shownProducts.map(product => {
            const brandKnown = cleanBrand(product.brand) !== "Marca não informada";
            return <Link key={product.id} to={`/produto/${product.slug || product.id}`}>
          <div className="store-pro-product-image"><ProductImage product={product} /><ProductCardActions product={product} className="pca-row--overlay-left" showFavorite={false} showCart={false} /></div>
          <small className="store-pro-category">{humanizeCategory(product.category)}</small>
          <strong>{properCaseIfShouting(product.name)}</strong>
          {/* Sempre ocupa a linha (mesmo sem marca conhecida) para as fileiras
              do grid manterem a mesma altura; sem marca, a linha fica vazia
              em vez de anunciar a ausência dela. */}
          <span className={`store-pro-brand${brandKnown ? "" : " store-pro-brand--empty"}`} aria-hidden={brandKnown ? undefined : true}>{brandKnown && <><Tag aria-hidden="true"/><b>Marca</b> {cleanBrand(product.brand)}</>}</span>
          <span className="store-pro-spec">{formatProductSpec(product.size, product.unit)}</span>
          <footer><em>Menor preço</em><b>{brl.format(product.minPrice)}</b></footer>
        </Link>;
          })}
          {teaserProducts.map(product => {
            const brandKnown = cleanBrand(product.brand) !== "Marca não informada";
            return <Link key={product.id} to={signupHref} className="store-pro-product--teaser" aria-label={`Crie sua conta para ver o preço de ${product.name}`}>
          <div className="store-pro-product-image"><ProductImage product={product} /></div>
          <small className="store-pro-category">{humanizeCategory(product.category)}</small>
          <strong>{properCaseIfShouting(product.name)}</strong>
          <span className={`store-pro-brand${brandKnown ? "" : " store-pro-brand--empty"}`} aria-hidden={brandKnown ? undefined : true}>{brandKnown && <><Tag aria-hidden="true"/><b>Marca</b> {cleanBrand(product.brand)}</>}</span>
          <footer className="store-pro-product__blur"><em>Menor preço</em><b>{brl.format(product.minPrice)}</b></footer>
          <i className="store-pro-product__lock"><LockKeyhole aria-hidden="true"/></i>
        </Link>;
          })}
        </div> : <div className="store-pro-empty"><PackageSearch /><h3>Nenhum produto encontrado</h3><p>Tente outro nome ou remova algum filtro.</p><button type="button" className="pc-btn pc-btn--ghost" onClick={() => { setQuery(""); setCategory("Todos"); }}>Limpar filtros</button></div>}

        {isGuest && lockedTotal > 0 ? <div className="store-pro-gate"><div className="store-pro-gate__icon"><Sparkles aria-hidden="true" /></div><div className="store-pro-gate__copy"><h3>Veja os outros {lockedTotal} {lockedTotal === 1 ? "produto" : "produtos"} deste catálogo</h3><p>Visitantes veem uma prévia. Crie uma conta gratuita para comparar 100% dos preços deste e de outros estabelecimentos de Feijó.</p></div><div className="store-pro-gate__actions"><Link className="pc-btn pc-btn--primary" to={signupHref}><UserPlus aria-hidden="true" /> Criar conta grátis</Link><Link className="store-pro-gate__login" to={loginHref}>Já tenho conta</Link></div></div> : pageCount > 1 && <nav className="store-pro-pagination" aria-label="Paginação do catálogo">
          <span>Mostrando {startResult}-{endResult} de {filteredProducts.length}</span>
          <div><button type="button" disabled={safePage === 1} onClick={() => setPage(value => Math.max(1, value - 1))} aria-label="Página anterior"><ChevronLeft /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).filter(number => number === 1 || number === pageCount || Math.abs(number - safePage) <= 1).map((number, index, list) => <span key={number}>{index > 0 && number - list[index - 1] > 1 && <i>…</i>}<button type="button" className={number === safePage ? "is-active" : ""} aria-current={number === safePage ? "page" : undefined} onClick={() => setPage(number)}>{number}</button></span>)}<button type="button" disabled={safePage === pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))} aria-label="Próxima página"><ChevronRight /></button></div>
        </nav>}
      </section>

      <aside className="store-pro-bottom-note">
        <ShieldCheck aria-hidden="true" /><strong>Informação para comparação</strong><span>Confirme estoque, disponibilidade e condições diretamente no estabelecimento.</span>
        {hasWhatsapp
          ? <a className="pc-btn pc-btn--ghost" href={whatsappHref(store.whatsapp as string, `Olá! Vi o catálogo de ${store.name} no PreçoCerto e queria confirmar um produto.`)} target="_blank" rel="noreferrer">Falar com a loja <ArrowRight aria-hidden="true" /></a>
          : <a className="pc-btn pc-btn--ghost" href={mapsHref} target="_blank" rel="noreferrer">Ver no mapa <ArrowRight aria-hidden="true" /></a>}
      </aside>
    </main>
    <footer className="store-pro-legal">© {new Date().getFullYear()} PreçoCerto · Feijó, Acre</footer>
  </div>;
}
