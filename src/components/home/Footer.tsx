import { Camera, Globe2, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const navigation = [
  { to: "/", label: "Início" },
  { to: "/buscar", label: "Buscar" },
  { to: "/explorar", label: "Categorias" },
  { to: "/estabelecimentos", label: "Lojas" },
  { to: "/buscar", label: "Promoções" },
];
const help = [
  { to: "/explorar", label: "Como funciona" },
  { to: "/contato", label: "Perguntas frequentes" },
  { to: "/contato", label: "Fale conosco" },
  { to: "/contato", label: "Política de privacidade" },
  { to: "/contato", label: "Termos de uso" },
];
const merchants = [
  { to: "/lojista", label: "Cadastre sua loja" },
  { to: "/painel-lojista", label: "Painel do comerciante" },
  { to: "/lojista", label: "Planos" },
  { to: "/contato", label: "Suporte" },
];

export function Footer() {
  return <footer className="pc26-footer pc26-footer--studio pc26-reference-footer">
    <div className="pc26-shell pc26-reference-footer__grid">
      <div className="pc26-footer-studio__intro">
        <Link className="pc26-footer-studio__brand" to="/" aria-label="Preço Certo - página inicial">
          <img src="/preco-certo-mark.svg" alt="" width="44" height="44" />
          <span><strong>Preço Certo</strong><small>Comparador local</small></span>
        </Link>
        <p className="pc26-footer-studio__pitch">O menor preço da cidade, na palma da sua mão.</p>
        <span className="pc26-footer-studio__location"><MapPin aria-hidden="true" /> Feijó, Acre</span>
        <div className="pc26-reference-footer__socials">
          <a href="https://precocertogpt.lovable.app" target="_blank" rel="noreferrer" aria-label="Site Preço Certo"><Globe2 aria-hidden="true" /></a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera aria-hidden="true" /></a>
          <Link to="/contato" aria-label="Contato"><MessageCircle aria-hidden="true" /></Link>
        </div>
      </div>

      <div className="pc26-footer-studio__col"><strong>Navegação</strong>{navigation.map(item => <Link key={`${item.to}-${item.label}`} to={item.to}>{item.label}</Link>)}</div>
      <div className="pc26-footer-studio__col"><strong>Ajuda</strong>{help.map(item => <Link key={`${item.to}-${item.label}`} to={item.to}>{item.label}</Link>)}</div>
      <div className="pc26-footer-studio__col"><strong>Para comerciantes</strong>{merchants.map(item => <Link key={`${item.to}-${item.label}`} to={item.to}>{item.label}</Link>)}</div>
    </div>

    <div className="pc26-footer-studio__meta">
      <div className="pc26-shell pc26-footer-studio__meta-row">
        <span>© 2026 Preço Certo - Feijó/AC. Todos os direitos reservados.</span>
        <span className="pc26-footer-studio__trust"><ShieldCheck aria-hidden="true" /> Informação local para escolhas mais conscientes</span>
        <span className="pc26-footer-studio__developer">Desenvolvido por <strong>Franc Denis</strong></span>
      </div>
    </div>
  </footer>;
}
