import { Heart, Leaf, ShieldCheck, Sprout, Users } from "lucide-react";

/** Faixa de confiança logo abaixo do hero (identidade 2026-09, ver banco de
 *  fotos/precocerto_pacote_visual/hero principal.png). São só chamadas de
 *  valor — nenhum número aqui, então nada a puxar do catálogo/Supabase. */
const ITEMS = [
  { icon: Leaf, title: "Mais economia", text: "Para você e sua família" },
  { icon: Users, title: "Comércio forte", text: "Gera empregos" },
  { icon: ShieldCheck, title: "Compra segura", text: "Seus dados protegidos" },
  { icon: Heart, title: "Feijó mais forte", text: "Juntos pelo comércio local" },
] as const;

export function TrustBar() {
  return (
    <div className="pcx-trustbar">
      <div className="pcx-shell pcx-trustbar__inner">
        <ul className="pcx-trustbar__list">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="pcx-trustbar__icon">
                <Icon aria-hidden="true" />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
            </li>
          ))}
        </ul>
        <p className="pcx-trustbar__tag">
          <Sprout aria-hidden="true" />
          <span>
            <strong>Preço Certo</strong>
            <small>Preços reais. Uma Feijó mais forte.</small>
          </span>
        </p>
      </div>
    </div>
  );
}
