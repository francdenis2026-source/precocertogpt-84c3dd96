import { BarChart3, ListChecks, MapPinned, Search } from "lucide-react";

interface HowItWorksStep {
  readonly icon: typeof Search;
  readonly title: string;
  readonly description: string;
}

const steps: readonly HowItWorksStep[] = [
  { icon: Search, title: "Busque um produto", description: "Digite o nome de qualquer produto e veja o preço em todas as lojas de Feijó em tempo real." },
  { icon: BarChart3, title: "Compare preços", description: "Veja a diferença de preço entre os estabelecimentos e encontre onde é mais barato." },
  { icon: ListChecks, title: "Crie sua lista", description: "Organize seus produtos em uma lista de compras e acompanhe os preços atualizados." },
  { icon: MapPinned, title: "Informações locais", description: "Conheça os endereços, bairros e catálogos dos estabelecimentos participantes." },
];

export function HowItWorks() {
  return <section className="pc26-section pc26-how" aria-labelledby="pc26-how-title">
    <div className="pc26-shell">
      <div className="pc26-section-heading pc26-how__heading">
        <div>
          <h2 id="pc26-how-title">Como o Preço Certo funciona</h2>
          <p>Quatro passos simples para comprar melhor no comércio de Feijó.</p>
        </div>
      </div>
      <ol className="pc26-how__grid">
        {steps.map(({ icon: Icon, title, description }, index) => <li className="pc26-how__card" key={title}>
          <i aria-hidden="true"><Icon /></i>
          <span className="pc26-how__step">{String(index + 1).padStart(2, "0")}</span>
          <strong>{title}</strong>
          <p>{description}</p>
        </li>)}
      </ol>
    </div>
  </section>;
}
