import { Download, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

export function AppPromoStrip() {
  return <section className="pc26-reference-app" aria-label="Instale o Preço Certo">
    <div className="pc26-shell pc26-reference-app__panel">
      <div className="pc26-reference-app__device"><Smartphone aria-hidden="true" /></div>
      <div className="pc26-reference-app__copy"><strong>Tenha o Preço Certo no celular</strong><span>Instale o aplicativo para consultar preços com mais rapidez.</span></div>
      <Link className="pc26-reference-app__cta" to="/instalar"><Download aria-hidden="true" /> Instalar</Link>
    </div>
  </section>;
}
