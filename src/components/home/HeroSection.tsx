import { ArrowRight, BadgeCheck, MapPin, Search, ShoppingBasket } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function HeroSection({ productCount, storeCount, priceCount }: { productCount: number; storeCount: number; priceCount: number }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/buscar?q=${encodeURIComponent(value)}` : "/buscar");
  };

  return <section className="pc26-hero"><div className="pc26-shell pc26-hero__grid">
    <div className="pc26-hero__content"><span className="pc26-eyebrow"><BadgeCheck aria-hidden="true" />Preços locais, decisão mais segura</span><h1>Antes de comprar, descubra <em>onde custa menos.</em></h1><p>Compare preços do comércio de Feijó em poucos segundos e escolha a loja que faz sua compra render mais.</p><form className="pc26-hero-search" role="search" onSubmit={submit}><Search aria-hidden="true" /><label className="sr-only" htmlFor="hero-price-search">Produto para comparar</label><input id="hero-price-search" name="produto" value={query} onChange={event => setQuery(event.target.value)} placeholder="O que você precisa comprar?" autoComplete="off"/><button type="submit">Buscar preço <ArrowRight aria-hidden="true" /></button></form><div className="pc26-hero__stats" aria-label="Cobertura do Preço Certo"><span><strong>{productCount || "—"}</strong><small>produtos</small></span><span><strong>{priceCount || "—"}</strong><small>preços registrados</small></span><span><strong>{storeCount || "—"}</strong><small>estabelecimentos</small></span></div></div>
    <aside className="pc26-proof" aria-label="Como economizar com o Preço Certo"><div className="pc26-proof__head"><span><MapPin aria-hidden="true" />Feijó, Acre</span><strong>Roteiro de economia</strong></div><ol><li><span>01</span><div><strong>Pesquise o produto</strong><small>Encontre ofertas locais disponíveis.</small></div></li><li><span>02</span><div><strong>Compare os valores</strong><small>Veja a menor opção com clareza.</small></div></li><li><span>03</span><div><strong>Planeje sua compra</strong><small>Monte uma lista antes de sair.</small></div></li></ol><Link to="/cesta-inteligente"><ShoppingBasket aria-hidden="true" />Criar minha lista <ArrowRight aria-hidden="true" /></Link></aside>
  </div></section>;
}
