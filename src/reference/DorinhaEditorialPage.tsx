import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useGSAP, gsap, ScrollTrigger } from "../lib/lightMotion";
import { ArrowLeft, ArrowRight, BookOpen, MessageCircle, Quote, Share2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import imagimacaoAsset from "../assets/uma-viagem-ao-mundo-da-imaginacao.png.asset.json";
import mentePerversaAsset from "../assets/mente-perversa.png.asset.json";
import superacaoAsset from "../assets/uma-historia-de-superacao.png.asset.json";
import despertarAsset from "../assets/o-despertar-para-o-mundo-literario.png.asset.json";
import "./DorinhaEditorialPage.css";

gsap.registerPlugin(ScrollTrigger);

type AssetMeta = { url: string };
type Book = { id: string; slug: string; name: string; image_url: string | null; description: string | null; price: number; promotional_price: number | null; price_on_request: boolean; available: boolean };
type Merchant = { author_name?: string | null; author_bio?: string | null; author_birthplace?: string | null; whatsapp?: string | null };
type Profile = { merchant?: Merchant | null; books?: unknown };

// Cada obra ganha uma nota de leitura própria (o que ela propõe, não só uma
// sinopse) e um tom de capa (usado no verso do cartão e na lombada) — a
// autora tem só quatro títulos; cada um merece apresentação própria, não
// uma linha genérica de catálogo.
const BOOK_NOTES: Record<string, { mood: string; tone: string }> = {
  "uma-viagem-ao-mundo-da-imaginacao": { mood: "Para ler com a imaginação aberta.", tone: "#5b3a86" },
  "mente-perversa": { mood: "Para quem não se incomoda com tensão.", tone: "#2c2430" },
  "uma-historia-de-superacao": { mood: "Para recomeços que precisam de coragem.", tone: "#8a4a26" },
  "o-despertar-para-o-mundo-literario": { mood: "Para quem está descobrindo a leitura.", tone: "#3d5a45" },
};

// Confirmado direto na busca "DORINHA BARROSO" da Amazon.com.br (loja
// Kindle + livros): título, link canônico do produto (/dp/<ASIN>, sem os
// parâmetros de rastreio da busca) e a capa exatamente como publicada lá —
// que em "Mente Perversa" é uma arte diferente da usada na venda direta
// (edição própria distinta). Mostrada à parte da vitrine principal, de
// propósito: a vitrine acima reflete o que a autora vende direto (preço e
// Pix dela); aqui é só onde mais encontrar as mesmas obras.
const RETAIL_LINKS: Record<string, { url: string; cover: string }> = {
  "uma-viagem-ao-mundo-da-imaginacao": { url: "https://www.amazon.com.br/dp/6525481074", cover: "/dorinha-barroso/amazon/uma-viagem-ao-mundo-da-imaginacao.jpg" },
  "mente-perversa": { url: "https://www.amazon.com.br/dp/8551865714", cover: "/dorinha-barroso/amazon/mente-perversa.jpg" },
  "uma-historia-de-superacao": { url: "https://www.amazon.com.br/dp/8541615162", cover: "/dorinha-barroso/amazon/uma-historia-de-superacao.jpg" },
  "o-despertar-para-o-mundo-literario": { url: "https://www.amazon.com.br/dp/8541615383", cover: "/dorinha-barroso/amazon/o-despertar-para-o-mundo-literario.jpg" },
};

const fallbackBooks: Book[] = [
  { id: "imaginação", slug: "uma-viagem-ao-mundo-da-imaginacao", name: "Uma Viagem ao Mundo da Imaginação", image_url: (imagimacaoAsset as AssetMeta).url, description: "Uma obra para atravessar novas paisagens pela força da imaginação e descobrir outros modos de olhar o mundo.", price: 0, promotional_price: null, price_on_request: true, available: true },
  { id: "mente", slug: "mente-perversa", name: "Mente Perversa", image_url: (mentePerversaAsset as AssetMeta).url, description: "Uma narrativa marcada por tensão, escolhas e camadas humanas que convidam o leitor à reflexão.", price: 0, promotional_price: null, price_on_request: true, available: true },
  { id: "superação", slug: "uma-historia-de-superacao", name: "Uma História de Superação", image_url: (superacaoAsset as AssetMeta).url, description: "Resistência, recomeços e a coragem necessária para transformar adversidades em novos caminhos.", price: 0, promotional_price: null, price_on_request: true, available: true },
  { id: "despertar", slug: "o-despertar-para-o-mundo-literario", name: "O Despertar para o Mundo Literário", image_url: (despertarAsset as AssetMeta).url, description: "Um convite para descobrir a literatura como espaço de expressão, memória e transformação.", price: 0, promotional_price: null, price_on_request: true, available: true },
];

const asBooks = (value: unknown): Book[] => Array.isArray(value) ? value.filter((item): item is Book => Boolean(item && typeof item === "object" && typeof (item as Book).name === "string")) : [];
const cleanPhone = (value: string) => value.replace(/\D/g, "");
const whatsapp = (phone: string, book?: string) => `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(book ? `Olá, Dorinha! Conheci o livro "${book}" no PreçoCerto e gostaria de saber valor e disponibilidade.` : "Olá, Dorinha! Conheci seu espaço literário no PreçoCerto e gostaria de saber mais sobre seus livros.")}`;

export function DorinhaEditorialPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    document.title = "Dorinha Barroso · Literatura acreana | PreçoCerto";
    void (async () => {
      if (!supabase) return;
      const { data, error } = await supabase.rpc("author_store_public_profile", { _slug: "dorinha-barroso-livros" });
      if (!active || error || !data) return;
      try { setProfile((typeof data === "string" ? JSON.parse(data) : data) as Profile); } catch { return; }
    })();
    return () => { active = false; };
  }, []);

  const remoteBooks = useMemo(() => asBooks(profile?.books), [profile]);
  const books = useMemo(() => fallbackBooks.map(local => {
    const remote = remoteBooks.find(book => book.slug === local.slug || book.name.toLocaleLowerCase("pt-BR") === local.name.toLocaleLowerCase("pt-BR"));
    return remote ? { ...local, ...remote, image_url: remote.image_url || local.image_url } : local;
  }), [remoteBooks]);

  const author = profile?.merchant?.author_name || "Dorinha Barroso";
  const birthplace = profile?.merchant?.author_birthplace || "Feijó, Acre";
  const phone = profile?.merchant?.whatsapp || "5568999564762";
  const bio = profile?.merchant?.author_bio || "Escritora acreana que transforma experiências, imaginação e sensibilidade em livros feitos para criar conexão com seus leitores. Sua obra aproxima memória, identidade e novos caminhos de leitura.";

  const share = async () => {
    const data = { title: "Dorinha Barroso · Literatura acreana", text: "Conheça os livros de Dorinha Barroso no PreçoCerto.", url: window.location.href };
    if (navigator.share) { try { await navigator.share(data); return; } catch { setCopied(false); } }
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); }
  };

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".db-hero__panel > *", { y: 20, opacity: 0, duration: .7, stagger: .08, ease: "power3.out" });
    gsap.from(".db-hero__portrait", { opacity: 0, scale: 1.04, duration: 1, ease: "power2.out" });
    gsap.utils.toArray<HTMLElement>(".db-reveal").forEach(section => {
      gsap.from(section, { scrollTrigger: { trigger: section, start: "top 88%", once: true }, y: 26, opacity: 0, duration: .6, ease: "power2.out" });
    });
    gsap.utils.toArray<HTMLElement>(".db-shelf__cover").forEach(cover => {
      gsap.from(cover, { scrollTrigger: { trigger: cover, start: "top 90%", once: true }, y: 34, opacity: 0, rotate: 0, duration: .7, ease: "power3.out" });
    });
  }, { scope: pageRef });

  return (
    <div className="db-page" ref={pageRef}>
      <header className="db-topbar">
        <Link className="db-topbar__back" to="/estabelecimentos"><ArrowLeft aria-hidden="true" /> PreçoCerto</Link>
        <span className="db-topbar__mark">Dorinha Barroso <small>Espaço da autora</small></span>
      </header>

      <main id="conteudo-principal">
        <section className="db-hero">
          <div className="db-hero__scene" aria-hidden="true" />
          <div className="db-hero__panel db-glass">
            <h1>Histórias nascidas no Acre,<br /><em>escritas para ficar.</em></h1>
            <p>{author} transforma vivência, imaginação e sensibilidade amazônica em livros — cada um pensado para criar uma conexão real com quem lê.</p>
            <div className="db-hero__actions">
              <a className="db-btn db-btn--gold" href="#vitrine">Ver as obras <ArrowRight aria-hidden="true" /></a>
              <a className="db-btn db-btn--ghost" href={whatsapp(phone)} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Falar com a autora</a>
            </div>
            <p className="db-hero__meta">{books.length} obras publicadas em seu acervo, escritas a partir de {birthplace} — cada uma com Pix disponível direto com a autora.</p>
          </div>
          <figure className="db-hero__portrait">
            <img src="/dorinha-author-portrait-v2.webp" alt={`Retrato da escritora ${author}`} />
          </figure>
        </section>

        <section className="db-vitrine db-reveal" id="vitrine">
          <div className="db-vitrine__head">
            <h2>Acervo de {author}</h2>
            <p>Toque em uma obra para ler a proposta do livro. A compra é direta com a autora, com Pix disponível na hora.</p>
          </div>

          <ol className="db-shelf">
            {books.map((book, index) => {
              const price = book.promotional_price || book.price;
              const direct = price > 0 && !book.price_on_request;
              // BOOK_NOTES é indexado pelo slug do fallback local, não pelo
              // de book.slug — o Supabase pode trazer um slug remoto
              // diferente para o mesmo título (aconteceu com "O Despertar
              // para o Mundo Literário": remoto vem sem o "o-" inicial) e
              // {...local,...remote} deixa esse slug remoto vencer. Como
              // books.map preserva a mesma ordem/tamanho de fallbackBooks,
              // o índice sempre aponta pro título certo, remoto ou não.
              const note = BOOK_NOTES[fallbackBooks[index].slug];
              return (
                <li className="db-shelf__item" key={book.id} style={{ "--db-tone": note?.tone || "#3d1a2e" } as CSSProperties}>
                  <article className={`db-shelf__card${index % 2 === 1 ? " is-reverse" : ""}`}>
                    <div className="db-shelf__cover">
                      <span className="db-shelf__spine" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      {book.image_url ? <img src={book.image_url} alt={`Capa do livro ${book.name}`} loading="lazy" /> : <span className="db-shelf__cover-fallback"><BookOpen aria-hidden="true" /></span>}
                    </div>
                    <div className="db-shelf__copy">
                      <h3>{book.name}</h3>
                      <p>{book.description}</p>
                      <p className="db-shelf__note">{note?.mood || "Um livro de Dorinha Barroso."}</p>
                      <footer>
                        <strong>{direct ? price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Valor sob consulta"}</strong>
                        {direct
                          ? <a className="db-btn db-btn--gold db-btn--sm" href={`?comprar=${encodeURIComponent(book.slug)}`}>Comprar direto <ArrowRight aria-hidden="true" /></a>
                          : <a className="db-btn db-btn--ghost db-btn--sm" href={whatsapp(phone, book.name)} target="_blank" rel="noreferrer">Consultar <ArrowRight aria-hidden="true" /></a>}
                      </footer>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="db-retail db-reveal" aria-labelledby="db-retail-title">
          <div className="db-retail__head">
            <h2 id="db-retail-title">Também nas livrarias digitais</h2>
            <p>Além da compra direta com a autora, estas obras estão à venda na Amazon (capa comum e Kindle) e nas principais plataformas digitais de livros do Brasil.</p>
          </div>
          <ul className="db-retail__list">
            {books.map((book, index) => {
              const retail = RETAIL_LINKS[fallbackBooks[index].slug];
              if (!retail) return null;
              return (
                <li key={book.id}>
                  <a href={retail.url} target="_blank" rel="noreferrer">
                    <img src={retail.cover} alt={`Capa de ${book.name} na Amazon`} loading="lazy" />
                    <span>{book.name}<small>Ver na Amazon <ArrowRight aria-hidden="true" /></small></span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="db-about db-reveal" id="autora">
          <figure className="db-about__portrait">
            <img src="/dorinha-author-portrait-v2.webp" alt={`Foto de ${author}`} loading="lazy" />
            <figcaption className="db-glass"><strong>{author}</strong><span>Literatura feita no Acre</span></figcaption>
          </figure>
          <div className="db-about__copy">
            <h2>{author}</h2>
            <p>{bio}</p>
            <blockquote><Quote aria-hidden="true" />&ldquo;Escrever é transformar vivências em caminhos que outras pessoas também podem percorrer.&rdquo;</blockquote>
          </div>
        </section>

        <section className="db-close db-reveal">
          <div>
            <h2>Encontre a próxima leitura.</h2>
            <p>Fale com {author} para confirmar valores, formas de pagamento e como receber os livros.</p>
          </div>
          <div className="db-close__actions">
            <a className="db-btn db-btn--gold" href={whatsapp(phone)} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Falar com {author.split(" ")[0]}</a>
            <button type="button" className="db-btn db-btn--ghost" onClick={share}><Share2 aria-hidden="true" /> {copied ? "Link copiado" : "Compartilhar página"}</button>
          </div>
        </section>
      </main>

      <footer className="db-footer">
        <span>Espaço literário de {author} · hospedado no PreçoCerto</span>
        <Link to="/estabelecimentos">Ver outros estabelecimentos</Link>
      </footer>
    </div>
  );
}
