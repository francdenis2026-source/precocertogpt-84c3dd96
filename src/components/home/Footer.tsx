import { Camera, Globe2, MapPin, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const groups = [
  {
    label: "Explorar",
    links: [
      { to: "/explorar", label: "Categorias" },
    ],
  },
  {
    label: "Ajuda",
    links: [
      { to: "/explorar", label: "Como funciona" },
      { to: "/contato", label: "Fale conosco" },
    ],
  },
  {
    label: "Comerciantes",
    links: [
      { to: "/lojista", label: "Cadastre sua loja" },
      { to: "/painel-lojista", label: "Painel do comerciante" },
      { to: "/contato", label: "Suporte" },
    ],
  },
];

export function Footer() {
  return <footer className="pc26-footer pc26-footer--studio pc26-reference-footer">
    <div className="pc26-shell pc26-footer-premium__top">
      <div className="pc26-footer-premium__identity">
        <Link className="pc26-footer-studio__brand" to="/" aria-label="Preço Certo - página inicial">
          <img src="/preco-certo-mark.svg" alt="" width="40" height="40" />
          <span><strong>Preço Certo</strong><small>Comparador local</small></span>
        </Link>
        <p>Compare preços e economize em Feijó.</p>
        <span className="pc26-footer-studio__location"><MapPin aria-hidden="true" /> Feijó, Acre</span>
      </div>

      <nav className="pc26-footer-premium__nav" aria-label="Links do rodapé">
        {groups.map(group => <div className="pc26-footer-premium__group" key={group.label}>
          <strong>{group.label}</strong>
          <div>{group.links.map(item => <Link key={`${group.label}-${item.label}`} to={item.to}>{item.label}</Link>)}</div>
        </div>)}
      </nav>

      <div className="pc26-footer-premium__social" aria-label="Canais do Preço Certo">
        <span>Conecte-se</span>
        <div>
          <a href="https://precocertogpt.lovable.app" target="_blank" rel="noreferrer" aria-label="Site Preço Certo"><Globe2 aria-hidden="true" /></a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera aria-hidden="true" /></a>
          <Link to="/contato" aria-label="Contato"><MessageCircle aria-hidden="true" /></Link>
        </div>
      </div>
    </div>

    <div className="pc26-footer-premium__rail">
      <div className="pc26-shell pc26-footer-premium__rail-inner">
        <span className="pc26-footer-premium__copyright">© 2026 Preço Certo · Feijó/AC · <Link to="/contato">Privacidade</Link> · <Link to="/contato">Termos</Link></span>
        <span className="pc26-footer-premium__trust"><ShieldCheck aria-hidden="true" /> Informação local para escolhas mais conscientes</span>
        <span className="pc26-footer-premium__signature"><Sparkles aria-hidden="true" /> Desenvolvido por <strong>Franc Denis</strong></span>
      </div>
    </div>
  </footer>;
}
