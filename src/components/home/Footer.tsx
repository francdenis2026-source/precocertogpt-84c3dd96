import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return <footer className="pc26-footer pc26-footer--studio">
    <div className="pc26-shell pc26-footer-studio">
      <div className="pc26-footer-studio__intro">
        <span className="pc26-footer-studio__eyebrow"><MapPin aria-hidden="true" /> Feijó, Acre</span>
        <strong>Compare melhor. Compre perto.</strong>
        <p>Preços locais, estabelecimentos e ferramentas para decidir sua compra com mais clareza.</p>
      </div>

      <nav className="pc26-footer-studio__nav" aria-label="Links úteis">
        <Link to="/estabelecimentos">Estabelecimentos <ArrowRight aria-hidden="true" /></Link>
        <Link to="/lojista">Seja parceiro <ArrowRight aria-hidden="true" /></Link>
        <Link to="/contato">Fale conosco <ArrowRight aria-hidden="true" /></Link>
      </nav>
    </div>

    <div className="pc26-footer-studio__meta">
      <div className="pc26-shell pc26-footer-studio__meta-row">
        <span>Preço Certo © 2026</span>
        <span className="pc26-footer-studio__developer">Desenvolvido por <strong>Franc D’nis</strong></span>
      </div>
    </div>
  </footer>;
}
