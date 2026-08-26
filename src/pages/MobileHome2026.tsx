import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Heart, MapPin, Moon, PackageSearch, Search, ShoppingBasket, Sun, TrendingDown, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { buildFeatured, currentCycle, msUntilNextCycle } from "../data/featuredRotation";
import { FestivalAcaiBar } from "../components/FestivalAcaiBar";
import { HeaderRadioPlayer } from "../components/PersistentRadio";
import { useSiteTheme } from "../hooks/useSiteTheme";
import { AppDock, FooterInfoDialogs, type FooterPanel } from "../reference/ReferenceExperience";
import { HomeQuickActionsCarousel } from "../components/HomeQuickActionsCarousel";
import { LocationSwitcher } from "../components/LocationSwitcher";
import { suggestProducts } from "../lib/productSearch";
import "./MobileHome2026.css";

const initialCatalog=buildCatalog();
const brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});

function ProductImage({product}:{product:Product}){const[failed,setFailed]=useState(false);const src=resolveProductImage(product);return src&&!failed?<img src={src} alt={product.name} loading="lazy" onError={()=>setFailed(true)}/>:<span className="mh26-image-fallback"><PackageSearch aria-hidden="true"/><small>Imagem em atualização</small></span>}

export function MobileHome2026(){
 const navigate=useNavigate();
 const{theme,toggleTheme}=useSiteTheme();
 const[catalog,setCatalog]=useState<CatalogPayload>({...initialCatalog,metrics:verifiedDatasetMetrics});
 const[loading,setLoading]=useState(true);
 const[catalogError,setCatalogError]=useState("");
 const[query,setQuery]=useState("");
 const[focused,setFocused]=useState(false);
 const[overlayStyle,setOverlayStyle]=useState<CSSProperties>({});
 const[footerPanel,setFooterPanel]=useState<FooterPanel>(null);
 const[cycle,setCycle]=useState(()=>currentCycle());
 const searchRef=useRef<HTMLFormElement>(null);
 useEffect(()=>{let active=true;fetchCatalog().then(data=>{if(active){setCatalog(data);setCatalogError(data.error||"")}}).catch(()=>{if(active)setCatalogError("Não foi possível atualizar o catálogo agora.")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
 useEffect(()=>{const timer=window.setTimeout(()=>setCycle(currentCycle()),msUntilNextCycle()+250);return()=>window.clearTimeout(timer)},[cycle]);
 const products=useMemo(()=>catalog.products.filter(p=>p.minPrice>0),[catalog.products]);
 const lastPriceUpdate=useMemo(()=>{const latest=products.reduce((current,product)=>Math.max(current,Date.parse(product.updated_at||product.capturedAt||"")||0),0);return latest?new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}).format(latest):"indisponível"},[products]);
 const results=useMemo(()=>query.trim().length<2?[]:suggestProducts(products,query,5),[query,products]);
 const featured=useMemo(()=>buildFeatured(products,cycle,4),[products,cycle]);
 const open=focused&&query.trim().length>=2;
 useEffect(()=>{
  if(!open)return;
  const syncPosition=()=>{
   const field=searchRef.current?.querySelector<HTMLElement>(".mh26-search-field");
   if(!field)return;
   const rect=field.getBoundingClientRect();
   const viewport=window.visualViewport;
   const viewportTop=viewport?.offsetTop??0;
   const viewportLeft=viewport?.offsetLeft??0;
   const viewportWidth=viewport?.width??window.innerWidth;
   const viewportHeight=viewport?.height??window.innerHeight;
   const width=Math.min(rect.width,viewportWidth-20);
   const left=Math.max(viewportLeft+10,Math.min(rect.left,viewportLeft+viewportWidth-width-10));
   const preferredTop=rect.bottom+8;
   const top=Math.min(preferredTop,viewportTop+Math.max(12,viewportHeight-360));
   const maxHeight=Math.max(240,viewportTop+viewportHeight-top-12);
   setOverlayStyle({top,left,width,maxHeight});
  };
  syncPosition();
  window.addEventListener("resize",syncPosition);
  window.addEventListener("scroll",syncPosition,{passive:true});
  window.visualViewport?.addEventListener("resize",syncPosition);
  window.visualViewport?.addEventListener("scroll",syncPosition);
  return()=>{
   window.removeEventListener("resize",syncPosition);
   window.removeEventListener("scroll",syncPosition);
   window.visualViewport?.removeEventListener("resize",syncPosition);
   window.visualViewport?.removeEventListener("scroll",syncPosition);
  };
 },[open]);
 const resultPanel=open&&typeof document!=="undefined"?createPortal(<div className="mh26-search-overlay mh26-search-overlay--portal" style={overlayStyle} role="region" aria-label="Resultados da pesquisa" aria-live="polite">
   <header><div><small>RESULTADOS AO VIVO</small><strong>{results.length?"Melhores opções":"Nenhum resultado"}</strong></div><div className="mh26-search-overlay-actions"><span>{loading?"Atualizando…":`${results.length}/5`}</span><button type="button" onClick={()=>setFocused(false)} aria-label="Fechar resultados"><X aria-hidden="true"/></button></div></header>
   <div className="mh26-search-list" id="mh26-search-results" role="listbox" aria-label="Produtos encontrados">{results.length?results.map(product=><button type="button" role="option" aria-selected="false" key={product.id} onMouseDown={e=>e.preventDefault()} onClick={()=>{setFocused(false);navigate(`/produto/${product.slug||product.id}`)}}><i><ProductImage product={product}/></i><span><small>{product.category}</small><strong>{product.name}</strong><em>{product.establishment||"Comércio local"}</em></span><b>{brl.format(product.minPrice)}</b></button>):<div className="mh26-search-empty"><PackageSearch aria-hidden="true"/><span><strong>Não encontramos esse produto.</strong><small>Tente outra palavra ou marca.</small></span></div>}</div>
   <Link to={`/buscar?q=${encodeURIComponent(query.trim())}`} onClick={()=>setFocused(false)}>Ver busca completa <ArrowRight/></Link>
  </div>,document.body):null;
 return <div className="mh26-page">
  <header className="mh26-header"><FestivalAcaiBar/><div className="mh26-header-row"><div className="mh26-head-radio"><HeaderRadioPlayer/></div><div className="mh26-head-actions"><Link to="/favoritos" aria-label="Favoritos" title="Favoritos"><Heart aria-hidden="true"/></Link><Link to="/cesta-inteligente" aria-label="Minha lista" title="Minha lista"><ShoppingBasket aria-hidden="true"/></Link><button className="mh26-theme" type="button" onClick={toggleTheme} aria-label={theme==="dark"?"Ativar modo claro":"Ativar modo escuro"} title={theme==="dark"?"Modo claro":"Modo escuro"}>{theme==="dark"?<Sun aria-hidden="true"/>:<Moon aria-hidden="true"/>}</button><Link to="/estabelecimentos" aria-label="Ver estabelecimentos próximos" title="Estabelecimentos"><MapPin aria-hidden="true"/></Link></div></div></header>
  <main id="conteudo-principal">
   <section className="mh26-hero"><div className="mh26-hero-copy"><LocationSwitcher/><h1>Economize antes de comprar.</h1><p>Compare preços reais do comércio local e encontre onde vale mais a pena comprar.</p><form ref={searchRef} className="mh26-search" role="search" onSubmit={event=>{event.preventDefault();if(query.trim())navigate(`/buscar?q=${encodeURIComponent(query.trim())}`)}}><label className="mh26-search-label" htmlFor="mh26-search-input">O que você procura?</label><div className="mh26-search-field"><Search aria-hidden="true"/><input id="mh26-search-input" value={query} onChange={event=>setQuery(event.target.value)} onFocus={()=>setFocused(true)} autoComplete="off" enterKeyHint="search" placeholder="Ex.: arroz, café, leite..." aria-controls="mh26-search-results" aria-expanded={open}/>{query?<button className="mh26-search-clear" type="button" onClick={()=>setQuery("")} aria-label="Limpar busca"><X aria-hidden="true"/></button>:null}<button className="mh26-search-submit" type="submit">Buscar</button></div>{resultPanel}<div className="mh26-quick"><span>Mais buscados:</span>{["Arroz","Café","Leite","Açúcar"].map(item=><button key={item} type="button" onClick={()=>{setQuery(item);setFocused(true)}}>{item}</button>)}</div><div className="mh26-catalog-status"><span>{loading?"Atualizando catálogo…":`${products.length} produtos disponíveis`}</span><em>Atualizado {lastPriceUpdate}</em>{catalogError?<button type="button" onClick={()=>window.location.reload()}>Tentar atualizar</button>:null}</div></form></div></section>
   <HomeQuickActionsCarousel/>
   <section className="mh26-section"><header><div><small><TrendingDown aria-hidden="true"/>DESTAQUES AGORA</small><h2>Preços para comparar</h2></div><Link to="/buscar">Ver todos</Link></header><div className="mh26-products">{loading?Array.from({length:4},(_,index)=><div className="mh26-product is-loading" key={index}/>):featured.map(product=><Link to={`/produto/${product.slug||product.id}`} className="mh26-product" key={product.id}><i><ProductImage product={product}/></i><span><small>{product.category}</small><strong>{product.name}</strong><em>{product.establishment||"Comércio local"}</em></span><b>{brl.format(product.minPrice)}<small>menor preço</small></b></Link>)}</div></section>
   <section className="mh26-local"><div><small>COMÉRCIO LOCAL</small><h2>Encontre estabelecimentos perto de você.</h2><p>Explore lojas, mercados e serviços e compare antes de sair de casa.</p><Link to="/estabelecimentos">Explorar estabelecimentos <ArrowRight aria-hidden="true"/></Link></div></section>
  </main>
  <footer className="mh26-footer"><div className="mh26-footer-note"><button type="button" onClick={()=>setFooterPanel("terms")}>Termos</button><button type="button" onClick={()=>setFooterPanel("privacy")}>Privacidade</button><button type="button" onClick={()=>setFooterPanel("about")}>Sobre</button></div></footer>
  <AppDock active="home"/>
  <FooterInfoDialogs panel={footerPanel} onClose={()=>setFooterPanel(null)}/>
 </div>;
}
