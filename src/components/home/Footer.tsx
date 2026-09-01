import { ArrowRight, BadgeCheck, Mail, MapPin, ShieldCheck, Store, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";

const navigation = [
  {
    title: "Compare",
    links: [
      { to: "/buscar", label: "Buscar produtos" },
      { to: "/explorar", label: "Explorar categorias" },
      { to: "/cesta-inteligente", label: "Cesta inteligente" },
    ],
  },
  {
    title: "Comércio local",
    links: [
      { to: "/estabelecimentos", label: "Ver estabelecimentos" },
      { to: "/lojista", label: "Cadastrar minha loja" },
      { to: "/contato", label: "Fale com a equipe" },
    ],
  },
] as const;

export function Footer() {
  return <footer className="pc26-footer pc26-footer--studio pc26-reference-footer">
    <div className="pc26-shell pc26-footer-cta">
      <div className="pc26-footer-cta__icon"><TrendingDown aria-hidden="true" /></div>
      <div>
        <span>Economia começa com informação</span>
        <strong>Consulte antes de comprar.</strong>
      </div>
      <Link to="/buscar">Comparar preços <ArrowRight aria-hidden="true" /></Link>
    </div>

    <div className="pc26-shell pc26-footer-main">
      <div className="pc26-footer-identity">
        <Link className="pc26-footer-studio__brand" to="/" aria-label="Preço Certo - página inicial">
          <img src="/preco-certo-mark.svg?v=17" alt="" width="44" height="44" />
          <span><strong>Preço Certo</strong><small>Comparador local</small></span>
        </Link>
        <p>Preços e estabelecimentos de Feijó reunidos para decisões de compra mais simples e conscientes.</p>
        <span className="pc26-footer-studio__location"><MapPin aria-hidden="true" /> Feijó, Acre</span>
      </div>

      <nav className="pc26-footer-navigation" aria-label="Links do rodapé">
        {navigation.map(group => <div key={group.title}>
          <strong>{group.title}</strong>
          {group.links.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}
        </div>)}
      </nav>

      <aside className="pc26-footer-business" aria-label="Área para comerciantes">
        <Store aria-hidden="true" />
        <span><strong>Seu comércio no Preço Certo</strong><small>Leve seus produtos para mais clientes de Feijó.</small></span>
        <Link to="/lojista">Cadastrar estabelecimento <ArrowRight aria-hidden="true" /></Link>
      </aside>
    </div>

    <div className="pc26-footer-meta">
      <div className="pc26-shell pc26-footer-premium__rail-inner">
        <span className="pc26-footer-premium__copyright">© 2026 Preço Certo · <Link to="/contato">Privacidade</Link> · <Link to="/contato">Termos</Link></span>
        <span className="pc26-footer-premium__trust"><ShieldCheck aria-hidden="true" /> Navegação segura</span>
        <Link className="pc26-footer-contact" to="/contato"><Mail aria-hidden="true" /> Atendimento</Link>
        <span className="pc26-footer-premium__signature"><BadgeCheck aria-hidden="true" /> Desenvolvido por <strong>Franc Denis</strong></span>
      </div>
    </div>
  </footer>;
}
