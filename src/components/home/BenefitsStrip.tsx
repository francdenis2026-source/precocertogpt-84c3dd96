import { BadgePercent, ShieldCheck, Smartphone, Store, Tags } from "lucide-react";
const benefits=[
  {icon:Tags,title:"Compare preços",text:"Encontre o melhor preço perto de você"},
  {icon:BadgePercent,title:"Ofertas reais",text:"Promoções atualizadas em tempo real"},
  {icon:Store,title:"Comércio local",text:"Fortaleça os negócios da nossa região"},
  {icon:ShieldCheck,title:"Seguro e confiável",text:"Informações claras para comprar melhor"},
  {icon:Smartphone,title:"Acesso fácil",text:"Use no celular, tablet ou computador"},
];
export function BenefitsStrip(){return <section className="pc26-benefits pc26-shell" aria-label="Vantagens do Preço Certo">{benefits.map(({icon:Icon,title,text})=><article key={title}><i><Icon aria-hidden="true"/></i><div><strong>{title}</strong><span>{text}</span></div></article>)}</section>}
