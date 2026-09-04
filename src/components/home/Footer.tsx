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
  { to: "/explorar", label: "Categorias" },
  { to: "/estabelecimentos", label: "Estabelecimentos" },
  { to: "/cesta-inteligente", label: "Cesta inteligente" },
  { to: "/contato", label: "Contato" },
] as const;

export function Footer() {
  return (
    <footer className="pcx-footer">
      <div className="pcx-footer__row">
        <Link
          className="pcx-footer__brand"
          to="/"
          aria-label="Preço Certo - página inicial"
        >
          <img src="/preco-certo-mark.svg?v=17" alt="" width="28" height="28" />
          <span>
            <strong>Preço Certo</strong>
            <small>
              <MapPin aria-hidden="true" /> Feijó, Acre
            </small>
          </span>
        </Link>

        <nav className="pcx-footer__nav" aria-label="Links do rodapé">
          {navigation.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="pcx-footer__cta" to="/lojista">
          <Store aria-hidden="true" /> Cadastrar estabelecimento{" "}
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>

      <div className="pcx-footer__meta">
        <span>© 2026 Preço Certo · Feijó, Acre</span>
        <span>
          <ShieldCheck aria-hidden="true" /> Navegação segura
        </span>
        <span>
          <BadgeCheck aria-hidden="true" /> Desenvolvido por{" "}
          <strong>Franc Denis</strong>
        </span>
      </div>
    </footer>
  );
}
