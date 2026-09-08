import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type SectionHeaderProps = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  linkTo?: string;
  linkLabel?: ReactNode;
  linkIcon?: ReactNode;
};

/** Cabeçalho de seção reutilizado por Ofertas, Categorias, Estabelecimentos e
 *  Mais buscados — extraído para não repetir a mesma marcação `.pcx-section__head`
 *  quatro vezes em quatro componentes diferentes. */
export function SectionHeader({ id, title, description, linkTo, linkLabel, linkIcon }: SectionHeaderProps) {
  return (
    <div className="pcx-section__head">
      <div>
        <h2 id={id}>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {linkTo && linkLabel && (
        <Link className="pcx-section__link" to={linkTo}>
          {linkLabel} {linkIcon}
        </Link>
      )}
    </div>
  );
}
