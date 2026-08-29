import { Download, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

export function AppPromoStrip() {
  return <section className="pc26-reference-app" aria-label="Instale o Preço Certo">
    <div className="pc26-shell pc26-reference-app__panel">
      <div className="pc26-reference-app__device"><Smartphone aria-hidden="true" /></div>
      <div className="pc26-reference-app__copy"><strong>Leve o Preço Certo com você!</strong><span>Instale o app e tenha os melhores preços na palma da sua mão.</span></div>
      <Link className="pc26-reference-app__cta" to="/instalar"><Download aria-hidden="true" /> Instalar agora</Link>
      <div className="pc26-reference-app__qr" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
    </div>
  </section>;
}
