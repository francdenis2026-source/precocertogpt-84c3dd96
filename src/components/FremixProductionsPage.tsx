import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight, Copyright, Disc3, ExternalLink, ListMusic, Mail, Music2, Play, Share2, Users, Video } from "lucide-react";
import { supabase } from "../lib/supabase";
import "./FremixProductionsPage.css";

type Profile = { display_name: string; tagline: string | null; bio: string | null; youtube_url: string | null; contact_email: string | null; rights_note: string | null; accent_color: string | null };

const CHANNEL = "https://www.youtube.com/@Fremixprodu%C3%A7%C3%B5es";

// Seleção curada direto do canal oficial (checado em set/2026), mesclando
// várias playlists musicais do canal — Pura Nostalgia, Inspiração, As Ruas
// Têm Memória, Piseiro e Forró, Funk Brazil — em vez de repetir sempre a
// mesma. Sem produções institucionais/sob encomenda aqui: essa vitrine é
// só a música da FreMix.
const FEATURED_VIDEOS: { id: string; title: string; tag: string }[] = [
  { id: "U2Tl1fTNw6A", title: "Capoeira Feijó — A Força da Nossa Cultura", tag: "As Ruas Têm Memória" },
  { id: "7D1bNJsIfmI", title: "Pisadinha do Brasil", tag: "Piseiro e Forró" },
  { id: "Ht05m7ZwKHA", title: "Still Standing", tag: "Inspiração" },
  { id: "twH4xRdFrNw", title: "Nas Ondas (EDM x 80s Synths)", tag: "Pura Nostalgia" },
  { id: "dNMKgX2CjSM", title: "Funk com Pisadinha Carioca", tag: "Funk Brazil" },
  { id: "xYQ31B2GY44", title: "Entre a Augusta e a Consolação", tag: "As Ruas Têm Memória" },
];

// As 9 playlists reais do canal (nome e contagem conferidos direto no
// YouTube). O link de cada uma abre a playlist completa lá, com todos os
// créditos e a contagem sempre atualizada.
const PLAYLISTS: { name: string; count: number; list: string; tone: string }[] = [
  { name: "Pura Nostalgia", count: 26, list: "PLjTQpPhqwFTTHQqyK7xNPKrpa17dcLu84", tone: "#8b5cf6" },
  { name: "Inspiração", count: 10, list: "PLjTQpPhqwFTR0eS7mn0iWRgc5M7o_xK_D", tone: "#35e7ff" },
  { name: "As Ruas Têm Memória", count: 6, list: "PLjTQpPhqwFTRQ_-vf7Pea-qklld9-BAax", tone: "#ff3d9a" },
  { name: "Sertanejo", count: 5, list: "PLjTQpPhqwFTT-w_sl3GZZPe9wB7J9ANOJ", tone: "#f5a524" },
  { name: "Rap Nacional", count: 5, list: "PLjTQpPhqwFTQzf7QNrHGKafcww7w30jyq", tone: "#22c55e" },
  { name: "Piseiro e Forró", count: 5, list: "PLjTQpPhqwFTQmQgNOmSnew-tAE2pgy3R3", tone: "#f97316" },
  { name: "Funk Brazil", count: 3, list: "PLjTQpPhqwFTTatkdQLiFb97fzIlrCll5T", tone: "#eab308" },
  { name: "Dance/Pop/90", count: 2, list: "PLjTQpPhqwFTSgfH-WKO28sA0wwCKGlPMJ", tone: "#35e7ff" },
  { name: "Rock", count: 1, list: "PLjTQpPhqwFTS_hytojaEao_igOUidM2cO", tone: "#ff3d9a" },
];

const DEFAULT_BIO = "A FreMix é um universo de sons e imagens que busca capturar emoções e memórias. Criada por Franc D'nis, a produtora transforma ideias em experiências que misturam nostalgia, cores vibrantes e atmosferas cinematográficas. Entre sintetizadores, neon e melodias marcantes, a FreMix convida você a embarcar em uma viagem musical e visual, onde cada projeto conta uma história e desperta sensações únicas.";

export function FremixProductionsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState(FEATURED_VIDEOS[0].id);

  useEffect(() => {
    document.title = "FreMix Produções | Som e imagem feitos em Feijó | PreçoCerto";
    if (!supabase) return;
    void (async () => {
      const { data } = await supabase.from("cultural_profiles").select("display_name,tagline,bio,youtube_url,contact_email,rights_note,accent_color").eq("slug", "fremix-producoes").maybeSingle();
      setProfile(data as Profile | null);
    })();
  }, []);

  const channel = profile?.youtube_url || CHANNEL;
  const bio = profile?.bio || DEFAULT_BIO;
  const activeVideo = FEATURED_VIDEOS.find(video => video.id === active) || FEATURED_VIDEOS[0];

  async function share() {
    const data = { title: "FreMix Produções", text: "Som, imagem e nostalgia feitos em Feijó — conheça a FreMix Produções no PreçoCerto.", url: location.href };
    if (navigator.share) { try { await navigator.share(data); return; } catch { /* usuário cancelou o share nativo */ } }
    try { await navigator.clipboard.writeText(location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* clipboard indisponível */ }
  }

  return <main className="fx-page">
    <header className="fx-topbar">
      <a className="fx-topbar__back" href="/estabelecimentos">← PreçoCerto</a>
      <span className="fx-topbar__mark">FreMix Produções <small>Som e imagem de Feijó</small></span>
    </header>

    <section className="fx-hero">
      <div className="fx-hero__scene" aria-hidden="true">
        <span className="fx-eq" style={{ "--fx-delay": "0s" } as React.CSSProperties} />
        <span className="fx-eq" style={{ "--fx-delay": ".15s" } as React.CSSProperties} />
        <span className="fx-eq" style={{ "--fx-delay": ".3s" } as React.CSSProperties} />
        <span className="fx-eq" style={{ "--fx-delay": ".45s" } as React.CSSProperties} />
        <span className="fx-eq" style={{ "--fx-delay": ".6s" } as React.CSSProperties} />
        <span className="fx-eq" style={{ "--fx-delay": ".75s" } as React.CSSProperties} />
        <span className="fx-eq" style={{ "--fx-delay": ".9s" } as React.CSSProperties} />
        <span className="fx-ring" />
      </div>
      <div className="fx-hero__panel fx-glass">
        <h1>Som, imagem e <em>nostalgia</em>,<br />feitos em Feijó.</h1>
        <p>{profile?.tagline || "Franc D'nis mistura sintetizadores, neon e memória em cada faixa e cada vídeo — uma produtora independente que também empresta a câmera e o estúdio para histórias da cidade."}</p>
        <div className="fx-hero__actions">
          <a className="fx-btn fx-btn--pink" href={channel} target="_blank" rel="noreferrer"><Play aria-hidden="true" /> Assistir no canal</a>
          <a className="fx-btn fx-btn--ghost" href="#assistir"><Video aria-hidden="true" /> Ver produções</a>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={() => void share()}><Share2 aria-hidden="true" /> {copied ? "Link copiado" : "Compartilhar"}</button>
        </div>
        <div className="fx-hero__stats">
          <span><Video aria-hidden="true" /> 118 vídeos publicados</span>
          <span><ListMusic aria-hidden="true" /> 9 playlists organizadas</span>
          <span><Users aria-hidden="true" /> Canal oficial no YouTube</span>
        </div>
      </div>
    </section>

    <section className="fx-watch" id="assistir" aria-labelledby="fx-watch-title">
      <div className="fx-watch__head">
        <h2 id="fx-watch-title">Assista às produções.</h2>
        <p>Uma mistura de faixas tiradas direto das playlists do canal — Pura Nostalgia, Inspiração, As Ruas Têm Memória e mais. Escolha uma capa para trocar o vídeo em reprodução.</p>
        <a href={`${channel}/videos`} target="_blank" rel="noreferrer" className="fx-link">Ver todos os 118 vídeos <ExternalLink aria-hidden="true" /></a>
      </div>
      <div className="fx-watch__layout">
        <div className="fx-watch__player">
          <div className="fx-watch__frame">
            <iframe
              key={active}
              src={`https://www.youtube-nocookie.com/embed/${active}`}
              title={activeVideo.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="fx-watch__meta">
            <span className="fx-watch__tag">{activeVideo.tag}</span>
            <strong>{activeVideo.title}</strong>
            <a href={`https://www.youtube.com/watch?v=${active}`} target="_blank" rel="noreferrer">Abrir no YouTube <ExternalLink aria-hidden="true" /></a>
          </div>
        </div>
        <ol className="fx-watch__grid">
          {FEATURED_VIDEOS.map(video => {
            const selected = video.id === active;
            return <li key={video.id}>
              <button type="button" className={`fx-thumb${selected ? " is-active" : ""}`} onClick={() => setActive(video.id)} aria-pressed={selected}>
                <span className="fx-thumb__image"><img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" /><i><Play aria-hidden="true" fill="currentColor" /></i></span>
                <span className="fx-thumb__text"><small>{video.tag}</small><strong>{video.title}</strong></span>
              </button>
            </li>;
          })}
        </ol>
      </div>
    </section>

    <section className="fx-playlists" aria-labelledby="fx-playlists-title">
      <div className="fx-playlists__head">
        <h2 id="fx-playlists-title">Playlists do canal.</h2>
        <p>Cada faixa entra numa playlist por gênero — de nostalgia synthwave a piseiro e capoeira. {PLAYLISTS.reduce((total, item) => total + item.count, 0)} vídeos organizados em 9 coleções.</p>
      </div>
      <ol className="fx-playlists__rack">
        {PLAYLISTS.map(playlist => <li key={playlist.list}>
          <a className="fx-playlist-row" href={`https://www.youtube.com/playlist?list=${playlist.list}`} target="_blank" rel="noreferrer" style={{ "--fx-tone": playlist.tone } as React.CSSProperties}>
            <Disc3 aria-hidden="true" className="fx-playlist-row__icon" />
            <span className="fx-playlist-row__name">{playlist.name}</span>
            <span className="fx-playlist-row__count">{playlist.count} {playlist.count === 1 ? "vídeo" : "vídeos"}</span>
            <ChevronRight aria-hidden="true" className="fx-playlist-row__chevron" />
          </a>
        </li>)}
      </ol>
    </section>

    <section className="fx-about" aria-labelledby="fx-about-title">
      <div className="fx-about__copy">
        <h2 id="fx-about-title">A produtora por trás do som.</h2>
        <p>{bio}</p>
      </div>
      <div className="fx-about__trio">
        <div className="fx-info"><Music2 aria-hidden="true" /><b>Produção musical</b><span>Composição, mixagem e clipe — do sintetizador à tela.</span></div>
        <div className="fx-info"><Video aria-hidden="true" /><b>Vídeos para negócios locais</b><span>A mesma produtora também assina vídeos institucionais e de apresentação para comércios e autores de Feijó.</span></div>
        <div className="fx-info"><Copyright aria-hidden="true" /><b>Licenciamento</b><span>Uso e reprodução de qualquer faixa devem ser combinados direto com a produtora.</span></div>
      </div>
    </section>

    <section className="fx-license" aria-labelledby="fx-license-title">
      <div>
        <h2 id="fx-license-title">Quer usar uma faixa ou contratar uma produção?</h2>
        <p>{profile?.rights_note || "Fale direto com a FreMix para autorizar o uso de uma música ou encomendar um vídeo para o seu negócio."}</p>
      </div>
      <aside className="fx-contact">
        <Mail aria-hidden="true" />
        <span>CONTATO</span>
        {profile?.contact_email
          ? <><strong>{profile.contact_email}</strong><a href={`mailto:${profile.contact_email}?subject=Contato via PreçoCerto - FreMix Produções`} className="fx-btn fx-btn--pink">Enviar e-mail</a></>
          : <><strong>Fale pelo canal oficial</strong><p>O e-mail comercial ainda não foi confirmado nesta vitrine. Use a página &ldquo;Sobre&rdquo; do canal para encontrar o contato mais atual.</p><a href={`${channel}/about`} target="_blank" rel="noreferrer" className="fx-btn fx-btn--ghost">Abrir contato no canal <ExternalLink aria-hidden="true" /></a></>}
      </aside>
    </section>

    <footer className="fx-footer">
      <span>FreMix Produções · espaço cultural hospedado no PreçoCerto</span>
      <div className="fx-footer__links">
        <a href={channel} target="_blank" rel="noreferrer">Canal no YouTube <ExternalLink aria-hidden="true" /></a>
        <a href="/estabelecimentos">Ver outros estabelecimentos <ArrowRight aria-hidden="true" /></a>
      </div>
    </footer>
  </main>;
}
