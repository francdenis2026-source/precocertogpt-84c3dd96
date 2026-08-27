import { BadgePercent, ShieldCheck, Smartphone, Store, Tags } from "lucide-react";
const benefits=[
  {icon:Tags,title:"Compare de verdade",text:"O mesmo produto em diferentes lojas"},
  {icon:BadgePercent,title:"Preços locais",text:"Valores encontrados no comércio de Feijó"},
  {icon:Store,title:"Escolha com clareza",text:"Veja loja, produto e menor preço"},
  {icon:ShieldCheck,title:"Informação verificável",text:"Dados claros para decidir melhor"},
  {icon:Smartphone,title:"Feito para o celular",text:"Pesquisa rápida onde você estiver"},
];
export function BenefitsStrip(){return <section className="pc26-benefits pc26-shell" aria-label="Vantagens do Preço Certo">{benefits.map(({icon:Icon,title,text})=><article key={title}><i><Icon aria-hidden="true"/></i><div><strong>{title}</strong><span>{text}</span></div></article>)}</section>}
