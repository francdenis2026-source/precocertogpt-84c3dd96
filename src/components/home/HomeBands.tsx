type HomeBandProps = {
  variant: "market" | "community";
  eyebrow: string;
  title: string;
  text: string;
};

function HomeBand({ variant, eyebrow, title, text }: HomeBandProps) {
  return (
    <section className={`pc26-visual-band pc26-visual-band--${variant}`} aria-label={title}>
      <div className="pc26-shell pc26-visual-band__inner">
        <div className="pc26-visual-band__copy">
          <span>{eyebrow}</span>
          <strong>{title}</strong>
          <p>{text}</p>
        </div>
      </div>
    </section>
  );
}

export function MarketVisualBand() {
  return <HomeBand variant="market" eyebrow="Compare melhor" title="O mercado inteiro em uma visão mais clara." text="Produtos, preços e lojas organizados para você decidir rápido." />;
}

export function CommunityVisualBand() {
  return <HomeBand variant="community" eyebrow="Comércio local" title="Comprar em Feijó também é fortalecer quem vende perto de você." text="Uma experiência local, prática e conectada ao dia a dia da cidade." />;
}
