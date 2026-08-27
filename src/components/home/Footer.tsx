import { ArrowUpRight, Building2, Handshake, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return <footer className="pc26-footer pc26-footer--studio">
    <div className="pc26-shell pc26-footer-studio">
      <div className="pc26-footer-studio__intro">
        <Link className="pc26-footer-studio__brand" to="/" aria-label="Preço Certo — página inicial">
          <img src="/preco-certo-mark.svg" alt="" width="48" height="48" />
          <span><strong>Preço Certo</strong><small>Comparador local</small></span>
        </Link>
        <h2>Compare melhor. Compre perto.</h2>
        <p>Preços e estabelecimentos de Feijó reunidos para você decidir com clareza antes de comprar.</p>
        <span className="pc26-footer-studio__location"><MapPin aria-hidden="true" /> Feijó, Acre</span>
      </div>

      <nav className="pc26-footer-studio__nav" aria-label="Links úteis">
        <Link to="/estabelecimentos"><Building2 aria-hidden="true" /><span><strong>Estabelecimentos</strong><small>Veja o comércio local</small></span><ArrowUpRight aria-hidden="true" /></Link>
        <Link to="/lojista"><Handshake aria-hidden="true" /><span><strong>Seja parceiro</strong><small>Cadastre seu negócio</small></span><ArrowUpRight aria-hidden="true" /></Link>
        <Link to="/contato"><MessageCircle aria-hidden="true" /><span><strong>Fale conosco</strong><small>Atendimento e suporte</small></span><ArrowUpRight aria-hidden="true" /></Link>
      </nav>
    </div>

    <div className="pc26-footer-studio__meta">
      <div className="pc26-shell pc26-footer-studio__meta-row">
        <span className="pc26-footer-studio__trust"><ShieldCheck aria-hidden="true" /> Informação local para escolhas mais conscientes</span>
        <span>© 2026 Preço Certo</span>
        <span className="pc26-footer-studio__developer">Desenvolvido por <strong>Franc D’nis</strong></span>
      </div>
    </div>
  </footer>;
}
