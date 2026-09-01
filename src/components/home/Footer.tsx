import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";

const navigation = [
  { to: "/buscar", label: "Buscar" },
  { to: "/explorar", label: "Setores" },
  { to: "/estabelecimentos", label: "Estabelecimentos" },
  { to: "/cesta-inteligente", label: "Cesta inteligente" },
  { to: "/contato", label: "Contato" },
] as const;

export function Footer() {
  return (
    <footer className="pc26-footer pc26-footer--studio pc26-reference-footer">
      <div className="pc26-shell pc26-footer-compact">
        <div className="pc26-footer-identity">
          <Link
            className="pc26-footer-studio__brand"
            to="/"
            aria-label="Preço Certo - página inicial"
          >
            <img
              src="/preco-certo-mark.svg?v=17"
              alt=""
              width="36"
              height="36"
            />
            <span>
              <strong>Preço Certo</strong>
              <small>Comparador local</small>
            </span>
          </Link>
          <span className="pc26-footer-studio__location">
            <MapPin aria-hidden="true" /> Feijó, Acre
          </span>
        </div>

        <nav className="pc26-footer-navigation" aria-label="Links do rodapé">
          {navigation.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="pc26-footer-business" to="/lojista">
          <Store aria-hidden="true" /> Cadastrar estabelecimento{" "}
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>

      <div className="pc26-footer-meta">
        <div className="pc26-shell pc26-footer-premium__rail-inner">
          <span className="pc26-footer-premium__copyright">
            © 2026 Preço Certo · Feijó, Acre
          </span>
          <span className="pc26-footer-premium__trust">
            <ShieldCheck aria-hidden="true" /> Navegação segura
          </span>
          <span className="pc26-footer-premium__signature">
            <BadgeCheck aria-hidden="true" /> Desenvolvido por{" "}
            <strong>Franc Denis</strong>
          </span>
        </div>
      </div>
    </footer>
  );
}
