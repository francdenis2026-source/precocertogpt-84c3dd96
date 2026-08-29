import { ArrowUpRight, Building2, Camera, Handshake, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const exploreLinks = [
  { to: "/mercados", label: "Mercados" },
  { to: "/padarias", label: "Padarias" },
  { to: "/acougues", label: "Açougues" },
  { to: "/farmacias", label: "Farmácias" },
];

const companyLinks = [
  { to: "/estabelecimentos", label: "Estabelecimentos" },
  { to: "/lojista", label: "Seja parceiro" },
  { to: "/favoritos", label: "Favoritos" },
  { to: "/buscar", label: "Buscar preços" },
];

export function Footer() {
  return <footer className="pc26-footer pc26-footer--studio">
    <div className="pc26-shell pc26-footer-studio__grid">
      <div className="pc26-footer-studio__intro">
        <Link className="pc26-footer-studio__brand" to="/" aria-label="Preço Certo - página inicial">
          <img src="/preco-certo-mark.svg" alt="" width="44" height="44" />
          <span><strong>Preço Certo</strong><small>Comparador local</small></span>
        </Link>
        <p className="pc26-footer-studio__pitch">Preços e estabelecimentos de Feijó reunidos para você decidir com clareza antes de comprar.</p>
        <span className="pc26-footer-studio__location"><MapPin aria-hidden="true" /> Feijó, Acre</span>
        <a className="pc26-footer-studio__social" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram do Preço Certo"><Camera aria-hidden="true" /></a>
      </div>

      <div className="pc26-footer-studio__col">
        <strong>Explorar</strong>
        {exploreLinks.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}
      </div>

      <div className="pc26-footer-studio__col">
        <strong>Preço Certo</strong>
        {companyLinks.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}
      </div>

      <div className="pc26-footer-studio__col pc26-footer-studio__contact">
        <strong>Contato</strong>
        <Link to="/contato"><MessageCircle aria-hidden="true" /><span>Fale conosco</span></Link>
        <Link to="/lojista"><Handshake aria-hidden="true" /><span>Cadastre seu negócio</span></Link>
        <Link to="/estabelecimentos"><Building2 aria-hidden="true" /><span>Comércio local</span><ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </div>

    <div className="pc26-footer-studio__meta">
      <div className="pc26-shell pc26-footer-studio__meta-row">
        <span className="pc26-footer-studio__trust"><ShieldCheck aria-hidden="true" /> Informação local para escolhas mais conscientes</span>
        <span>© 2026 Preço Certo</span>
        <span className="pc26-footer-studio__developer">Desenvolvido por <strong>Franc D'nis</strong></span>
      </div>
    </div>
  </footer>;
}
