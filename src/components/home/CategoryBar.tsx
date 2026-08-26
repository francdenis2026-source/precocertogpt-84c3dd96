import { Beef, Croissant, LayoutGrid, Pill, ShoppingCart, Sandwich, Tag } from "lucide-react";
import { Link } from "react-router-dom";
const categories=[
  {label:"Mercados",sub:"Compare preços",icon:ShoppingCart,to:"/mercados"},
  {label:"Padarias",sub:"Pães e confeitaria",icon:Croissant,to:"/padarias"},
  {label:"Açougues",sub:"Carnes e cortes",icon:Beef,to:"/acougues"},
  {label:"Farmácias",sub:"Medicamentos",icon:Pill,to:"/farmacias"},
  {label:"Lanchonetes",sub:"Lanches e refeições",icon:Sandwich,to:"/lanchonetes"},
  {label:"Ofertas",sub:"Promoções especiais",icon:Tag,to:"/buscar"},
];
export function CategoryBar(){return <section className="pc26-categories pc26-shell" aria-labelledby="categories-title"><div className="pc26-section-heading pc26-section-heading--center"><div><h2 id="categories-title">Explore por <em>categoria</em></h2><p>Encontre exatamente o que você precisa</p></div></div><div className="pc26-category-row pc26-category-grid">{categories.map(({label,sub,icon:Icon,to})=><Link className="pc26-category pc26-category-card" key={label} to={to}><i><Icon aria-hidden="true"/></i><strong>{label}</strong><span>{sub}</span></Link>)}</div><div className="pc26-category-more"><Link to="/explorar">Ver todas as categorias <LayoutGrid aria-hidden="true"/></Link></div></section>}
