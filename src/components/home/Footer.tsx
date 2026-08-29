import { Apple, Facebook, Instagram, MapPin, MessageCircle, Play, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const navigation = [
  { to: "/", label: "Início" },
  { to: "/buscar", label: "Buscar" },
  { to: "/explorar", label: "Categorias" },
  { to: "/estabelecimentos", label: "Lojas" },
  { to: "/buscar", label: "Promoções" },
];
const help = [
  { to: "/como-funciona", label: "Como funciona" },
  { to: "/faq", label: "Perguntas frequentes" },
  { to: "/contato", label: "Fale conosco" },
  { to: "/privacidade", label: "Política de privacidade" },
  { to: "/termos", label: "Termos de uso" },
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
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook aria-hidden="true" /></a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram aria-hidden="true" /></a>
          <Link to="/contato" aria-label="WhatsApp e contato"><MessageCircle aria-hidden="true" /></Link>
        </div>
      </div>

      <div className="pc26-footer-studio__col"><strong>Navegação</strong>{navigation.map(item => <Link key={`${item.to}-${item.label}`} to={item.to}>{item.label}</Link>)}</div>
      <div className="pc26-footer-studio__col"><strong>Ajuda</strong>{help.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}</div>
      <div className="pc26-footer-studio__col"><strong>Para comerciantes</strong>{merchants.map(item => <Link key={`${item.to}-${item.label}`} to={item.to}>{item.label}</Link>)}</div>
      <div className="pc26-footer-studio__col pc26-reference-footer__apps">
        <strong>Baixe o app</strong>
        <Link to="/instalar"><Play aria-hidden="true" /><span>Disponível no<br/><b>Google Play</b></span></Link>
        <Link to="/instalar"><Apple aria-hidden="true" /><span>Disponível na<br/><b>App Store</b></span></Link>
      </div>
    </div>

    <div className="pc26-footer-studio__meta">
      <div className="pc26-shell pc26-footer-studio__meta-row">
        <span>© 2026 Preço Certo - Feijó/AC. Todos os direitos reservados.</span>
        <span className="pc26-footer-studio__trust"><ShieldCheck aria-hidden="true" /> Informação local para escolhas mais conscientes</span>
        <span className="pc26-footer-studio__developer">Feito com ♥ para Feijó</span>
      </div>
    </div>
  </footer>;
}
