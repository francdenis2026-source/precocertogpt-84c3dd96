import { Clock3, PiggyBank, ShieldCheck, Store } from "lucide-react";
const benefits=[
  {icon:ShieldCheck,title:"Preços atualizados",text:"Diariamente nos melhores comércios de Feijó"},
  {icon:Clock3,title:"Economize tempo",text:"Compare e encontre o menor preço rapidamente"},
  {icon:Store,title:"Comércio local forte",text:"Valorize os estabelecimentos da nossa cidade"},
  {icon:PiggyBank,title:"Compra inteligente",text:"Escolha melhor, economize sempre"},
];
export function BenefitsStrip(){return <section className="pc26-zone pc26-zone--benefits pc26-reference-benefits" aria-label="Vantagens do Preço Certo"><div className="pc26-benefits pc26-shell">{benefits.map(({icon:Icon,title,text})=><article key={title}><i><Icon aria-hidden="true"/></i><div><strong>{title}</strong><span>{text}</span></div></article>)}</div></section>}
