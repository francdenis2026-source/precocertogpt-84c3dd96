import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const popular = ["Arroz", "Açúcar", "Café", "Leite", "Óleo", "Frango", "Feijão", "Papel Higiênico"];

export function HomePopularRail() {
  return <section className="pc26-reference-popular" aria-labelledby="popular-title">
    <div className="pc26-shell pc26-reference-popular__panel">
      <div className="pc26-reference-popular__title"><TrendingUp aria-hidden="true" /><strong id="popular-title">Mais buscados</strong></div>
      <div className="pc26-reference-popular__items">
        {popular.map(item => <Link key={item} to={`/buscar?q=${encodeURIComponent(item)}`}><span>{item}</span></Link>)}
      </div>
      <Link className="pc26-reference-popular__more" to="/buscar" aria-label="Abrir busca completa"><ArrowRight aria-hidden="true" /></Link>
    </div>
  </section>;
}
