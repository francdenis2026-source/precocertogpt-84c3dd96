type HomeBandProps = {
  variant: "market" | "community";
  eyebrow: string;
  title: string;
  text: string;
  steps: readonly string[];
};

function HomeBand({ variant, eyebrow, title, text, steps }: HomeBandProps) {
  return (
    <section className={`pc26-editorial-band pc26-editorial-band--${variant}`} aria-label={title}>
      <div className="pc26-editorial-band__media" aria-hidden="true" />
      <div className="pc26-shell pc26-editorial-band__inner">
        <div className="pc26-editorial-band__copy">
          <span className="pc26-editorial-band__eyebrow">{eyebrow}</span>
          <strong className="pc26-editorial-band__title">{title}</strong>
          <p>{text}</p>
        </div>
        <div className="pc26-editorial-band__rail" aria-label="Fluxo de comparação">
          {steps.map((step, index) => (
            <span key={step}>
              <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
              {step}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MarketVisualBand() {
  return <HomeBand variant="market" eyebrow="Comparação inteligente" title="Veja o preço. Compare a loja. Escolha melhor." text="Uma leitura rápida do que importa antes de comprar: produto, menor preço e onde encontrar." steps={["Produto", "Menor preço", "Loja"]} />;
}

export function CommunityVisualBand() {
  return <HomeBand variant="community" eyebrow="Feijó em primeiro plano" title="Comércio local com presença de marca, não de panfleto." text="A experiência conecta descoberta, preço e estabelecimentos sem tirar o foco da compra." steps={["Descubra", "Compare", "Compre local"]} />;
}
