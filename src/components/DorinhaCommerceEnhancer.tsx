import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Copy, CreditCard, ExternalLink, LockKeyhole, QrCode, ShieldCheck, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { supabase, SUPABASE_URL } from "../lib/supabase";

type Book={id:string;slug:string;name:string;price:number;promotional_price:number|null;price_on_request:boolean;preview_url?:string|null;preview_summary?:string|null;external_url?:string|null};
type Profile={merchant:{guest_pix_enabled?:boolean};books:Book[]};
type PixResult={orderNumber:string;status:string;qrCode?:string|null;qrCodeBase64?:string|null;ticketUrl?:string|null;total:number};
const brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
function qrUrl(slug:string,retry=0){const base=SUPABASE_URL.replace(/\/$/,"");return `${base}/functions/v1/book-sales-qr?book=${encodeURIComponent(slug)}&v=${retry}`}
function upperName(value:string){return value.toLocaleUpperCase("pt-BR")}
function lowerEmail(value:string){return value.toLocaleLowerCase("pt-BR").replace(/\s/g,"")}
function maskCpf(value:string){const digits=value.replace(/\D/g,"").slice(0,11);return digits.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2")}
function maskPhone(value:string){const digits=value.replace(/\D/g,"").slice(0,11);return digits.length>10?digits.replace(/(\d{2})(\d{5})(\d{1,4})/,"($1) $2-$3"):digits.replace(/(\d{2})(\d{4})(\d{1,4})/,"($1) $2-$3")}
async function functionErrorMessage(error:unknown){
 const fallback=error instanceof Error?error.message:"Não foi possível gerar o PIX.";
 const context=(error as {context?:Response})?.context;
 if(!context)return fallback;
 try{const payload=await context.clone().json();return payload?.error||payload?.detail||fallback}catch{return fallback}
}

export function DorinhaCommerceEnhancer(){
 const location=useLocation();
 const active=location.pathname==="/dorinha-barroso"||location.pathname.startsWith("/autora/");
 const [profile,setProfile]=useState<Profile|null>(null),[book,setBook]=useState<Book|null>(null),[pix,setPix]=useState<PixResult|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[copied,setCopied]=useState(false),[showQr,setShowQr]=useState(false),[qrStatus,setQrStatus]=useState<"loading"|"ready"|"error">("loading"),[qrRetry,setQrRetry]=useState(0);
 useEffect(()=>{if(!active||!supabase)return;void supabase.rpc("author_store_public_profile",{_slug:"dorinha-barroso-livros"}).then(({data})=>setProfile(data as Profile));},[active]);
 useEffect(()=>{if(!active||!profile)return;const wanted=new URLSearchParams(location.search).get("comprar");if(wanted){const b=profile.books.find(x=>x.slug===wanted);if(b)queueMicrotask(()=>setBook(b))}},[active,profile,location.search]);
 useEffect(()=>{if(!active||!profile)return;const enhance=()=>{document.querySelectorAll("article").forEach(card=>{const title=Array.from(card.querySelectorAll("h3,strong")).map(x=>x.textContent?.trim()).find(t=>profile.books.some(b=>b.name===t));if(!title)return;const b=profile.books.find(x=>x.name===title);if(!b)return;const direct=Array.from(card.querySelectorAll("a")).find(a=>a.textContent?.includes("Comprar direto"));if(direct&&!direct.getAttribute("data-pc-pix")){direct.setAttribute("data-pc-pix",b.slug);direct.setAttribute("href",`?comprar=${encodeURIComponent(b.slug)}`);direct.innerHTML="Comprar com PIX";direct.addEventListener("click",e=>{e.preventDefault();setBook(b);history.replaceState(null,"",`${location.pathname}?comprar=${encodeURIComponent(b.slug)}`)});const row=document.createElement("div");row.setAttribute("data-pc-book-tools",b.slug);row.style.cssText="display:flex;gap:6px;margin-top:8px";if(b.preview_url){const a=document.createElement("a");a.href=b.preview_url;a.target="_blank";a.rel="noreferrer";a.textContent="Ler prévia";a.style.cssText="flex:1;text-align:center;padding:9px;border:1px solid var(--pc-color-border);border-radius:9px;text-decoration:none;color:var(--pc-color-foreground);font-size:11px;font-weight:800";row.appendChild(a)}const q=document.createElement("button");q.type="button";q.textContent="QR da obra";q.style.cssText="flex:1;padding:9px;border:1px solid var(--pc-color-border);border-radius:9px;background:var(--pc-color-surface);color:var(--pc-color-foreground);font-size:11px;font-weight:800;cursor:pointer";q.onclick=()=>{setBook(b);setQrStatus("loading");setShowQr(true)};row.appendChild(q);direct.parentElement?.parentElement?.appendChild(row)}})};enhance();const mo=new MutationObserver(enhance);mo.observe(document.body,{subtree:true,childList:true});return()=>mo.disconnect()},[active,profile,location.pathname]);
 const unit=useMemo(()=>book?Number(book.promotional_price??book.price??0):0,[book]);
 function close(){setBook(null);setPix(null);setError("");setShowQr(false);if(active)history.replaceState(null,"",location.pathname)}
 function formatField(e: any, formatter: (value: string) => string) {
   e.target.value = formatter(e.target.value);
 }
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!book||!supabase)return;setBusy(true);setError("");setPix(null);
  const fd=new FormData(e.currentTarget);
  const body={bookId:book.id,quantity:Number(fd.get("quantity")||1),name:upperName(String(fd.get("name")||"").trim()),email:lowerEmail(String(fd.get("email")||"").trim()),cpf:String(fd.get("cpf")||"").replace(/\D/g,""),phone:String(fd.get("phone")||"").replace(/\D/g,"")};
  const {data,error:fnError}=await supabase.functions.invoke("author-guest-pix",{body});setBusy(false);
  if(fnError||data?.error){setError(data?.error||await functionErrorMessage(fnError)||"Não foi possível gerar o PIX.");return}setPix(data as PixResult)
 }
 async function copyPix(){if(!pix?.qrCode)return;await navigator.clipboard.writeText(pix.qrCode);setCopied(true);setTimeout(()=>setCopied(false),1600)}
 if(!active||!book)return null;
 return <div style={s.overlay} role="dialog" aria-modal="true" aria-labelledby="pix-title"><style>{`
  .pc-pix-modal{--pix-ink:#3a2118;--pix-muted:#765a4c;--pix-border:#e7d4c7;--pix-surface:#fffaf4;--pix-canvas:#fbf5ed;--pix-primary:#b64f32;--pix-primary-strong:#8f3822;--pix-accent:#c65d3b;--pix-danger:#9b3f27}
  .pc-pix-modal h2{font-size:clamp(1.25rem,2.4vw,1.5rem);line-height:1.1;margin:0}
  .pc-pix-modal h3,.pc-pix-modal p{margin:2px 0}
  .pc-pix-modal input:focus,.pc-pix-modal select:focus{border-color:var(--pix-primary)!important;box-shadow:0 0 0 3px rgba(182,79,50,.14)}
  @media(max-width:620px){.pc-pix-fields{grid-template-columns:1fr!important}.pc-pix-modal{max-height:calc(100dvh - 8px)!important;border-radius:13px!important}.pc-pix-form{padding:10px 14px 12px!important}.pc-pix-summary{grid-template-columns:1fr auto!important}.pc-pix-modal .pc-pix-summary>div:last-child{text-align:right!important}}
  @media(max-height:720px) and (min-width:621px){.pc-pix-modal .pc-pix-fields{gap:5px 9px!important}.pc-pix-modal input,.pc-pix-modal select{min-height:34px!important}.pc-pix-modal .pc-pix-form{gap:5px!important;padding-top:8px!important;padding-bottom:9px!important}}
 `}</style><div className="pc-pix-modal" style={s.modal}>
  <button type="button" aria-label="Fechar compra" style={s.close} onClick={close}><X size={20}/></button>
  <div style={s.brandBar}><span>PREÇOCERTO</span><div><ShieldCheck size={15}/> Ambiente seguro</div></div>
  <div style={s.head} className="pc-pix-head">
    <h2 id="pix-title">Finalize seu pedido</h2>
    <p style={s.bookName}>{book.name}</p>
    <p style={s.headText}>Preencha seus dados e gere o Pix com segurança.</p>
  </div>
  {showQr&&!pix?<section style={s.qrSection}><span style={s.iconCircle}><QrCode size={25}/></span><h3>QR da página desta obra</h3><p>Use este código para voltar diretamente à compra deste título.</p><div style={s.qrFrame}>{qrStatus==="loading"&&<span style={s.qrLoading}>Gerando QR Code…</span>}<img src={qrUrl(book.slug,qrRetry)} alt={`QR para comprar ${book.name}`} style={{...s.bookQr,opacity:qrStatus==="ready"?1:0}} onLoad={()=>setQrStatus("ready")} onError={()=>setQrStatus("error")}/>{qrStatus==="error"&&<div role="alert" style={s.qrError}><strong>Não foi possível carregar o QR.</strong><button type="button" onClick={()=>{setQrStatus("loading");setQrRetry(value=>value+1)}}>Tentar novamente</button></div>}</div><button style={s.primary} onClick={()=>setShowQr(false)}>Continuar para o pagamento</button></section>:pix?<section style={s.pix}><span style={s.successIcon}><Check size={25}/></span><span style={s.ok}>PIX GERADO COM SUCESSO</span><h3>Pedido #{pix.orderNumber}</h3><strong style={s.total}>{brl.format(pix.total)}</strong>{pix.qrCodeBase64&&<img src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="QR Code PIX" style={s.pixQr}/>}<button onClick={copyPix} style={s.primary}><Copy size={17}/>{copied?"Código copiado":"Copiar código PIX"}</button>{pix.ticketUrl&&<a href={pix.ticketUrl} target="_blank" rel="noreferrer" style={s.secondary}><ExternalLink size={16}/> Abrir no Mercado Pago</a>}<p style={s.secureNote}><LockKeyhole size={15}/> A confirmação acontece automaticamente após o pagamento.</p></section>:<form className="pc-pix-form" onSubmit={submit} style={s.form}>
   <div className="pc-pix-summary" style={s.orderSummary}><div style={s.summaryItem}><span>Livro selecionado</span><strong>{book.name}</strong></div><div style={{...s.summaryItem,...s.price}}><span>Valor unitário</span><strong>{brl.format(unit)}</strong></div></div>
   {unit<=0&&<div style={s.warning}>O preço deste título ainda não foi definido. O PIX será liberado assim que o valor for atualizado.</div>}
   {book.preview_url&&<a href={book.preview_url} target="_blank" rel="noreferrer" style={s.preview}><BookOpen size={16}/> Ler uma prévia antes de comprar</a>}
   <div style={s.sectionLabel}>DADOS DO COMPRADOR</div>
   <div className="pc-pix-fields" style={s.fields}>
     <label style={s.label}>Nome completo<input style={s.input} name="name" required minLength={3} maxLength={120} autoComplete="name" placeholder="SEU NOME COMPLETO" onInput={e=>formatField(e,upperName)}/></label>
     <label style={s.label}>E-mail para confirmação<input style={s.input} name="email" type="email" required maxLength={160} autoComplete="email" placeholder="seuemail@exemplo.com" onInput={e=>formatField(e,lowerEmail)}/></label>
     <label style={s.label}>CPF<input style={s.input} name="cpf" inputMode="numeric" required maxLength={14} placeholder="000.000.000-00" onInput={e=>formatField(e,maskCpf)}/></label>
     <label style={s.label}><span>Telefone <small>(opcional)</small></span><input style={s.input} name="phone" inputMode="tel" autoComplete="tel" maxLength={15} placeholder="(68) 99999-9999" onInput={e=>formatField(e,maskPhone)}/></label>
    <label style={s.label}>Quantidade<select style={s.input} name="quantity" defaultValue="1" required>{[1,2,3,4,5,6,7,8,9,10].map(q=><option key={q} value={q}>{q} {q===1?"exemplar":"exemplares"}</option>)}</select></label>
   </div>
   {error&&<div role="alert" style={s.error}><strong>Não foi possível gerar o PIX.</strong><span>{error}</span></div>}
   <button disabled={busy||unit<=0} style={{...s.primary,...((busy||unit<=0)?s.disabled:{})}}><CreditCard size={18}/>{busy?"Gerando seu PIX…":"Gerar PIX agora"}</button>
   <div style={s.trustRow}><span><ShieldCheck size={14}/> Pagamento Mercado Pago</span><span><LockKeyhole size={14}/> Dados protegidos</span></div>
   <small style={s.helper}>Seu CPF é usado somente para processar o pagamento. O pedido será confirmado automaticamente quando o Mercado Pago aprovar o PIX.</small>
  </form>}
 </div></div>
}

const s:Record<string,React.CSSProperties>={
 overlay:{position:"fixed",inset:0,zIndex:9999,background:"rgba(26,15,10,.72)",backdropFilter:"blur(8px)",display:"grid",placeItems:"center",padding:14},
 modal:{width:"min(560px,100%)",maxHeight:"calc(100dvh - 24px)",overflow:"auto",background:"var(--pix-surface)",border:"1px solid var(--pix-border)",borderRadius:16,position:"relative",boxShadow:"0 24px 60px rgba(58,33,24,.28)",fontFamily:"'Manrope Variable', Manrope, system-ui, sans-serif",color:"var(--pix-ink)"},
 close:{position:"absolute",right:10,top:9,border:"1px solid var(--pix-border)",background:"var(--pix-surface)",color:"var(--pix-ink)",borderRadius:9,width:32,height:32,display:"grid",placeItems:"center",cursor:"pointer",zIndex:2},
 brandBar:{minHeight:36,padding:"0 48px 0 18px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--pix-ink)",color:"var(--pix-surface)",fontSize:9,fontWeight:900,letterSpacing:".09em"},
 head:{padding:"14px 44px 13px 18px",background:"var(--pix-canvas)",borderBottom:"1px solid var(--pix-border)"},
 bookName:{fontWeight:850,color:"var(--pix-primary)",margin:"5px 0 1px",fontSize:13},headText:{color:"var(--pix-muted)",fontSize:11.5,lineHeight:1.4},
 form:{display:"grid",gap:10,padding:"14px 18px 16px"},orderSummary:{display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"center",padding:"10px 12px",border:"1px solid var(--pix-border)",borderRadius:10,background:"var(--pix-canvas)"},summaryItem:{display:"grid",gap:2,fontSize:11,color:"var(--pix-muted)"},price:{textAlign:"right"},sectionLabel:{fontSize:10,fontWeight:900,letterSpacing:".1em",color:"var(--pix-muted)",marginTop:2},
 fields:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 12px"},label:{display:"grid",gap:4,fontSize:11,fontWeight:800,color:"var(--pix-muted)"},input:{width:"100%",minHeight:40,border:"1px solid var(--pix-border)",borderRadius:8,padding:"0 11px",font:"inherit",fontSize:13,color:"var(--pix-ink)",background:"var(--pix-surface)",outline:"none",boxSizing:"border-box",transition:".18s ease"},
 warning:{padding:12,borderRadius:10,background:"color-mix(in srgb, var(--pix-accent) 10%, var(--pix-surface))",border:"1px solid color-mix(in srgb, var(--pix-accent) 30%, var(--pix-border))",color:"var(--pix-ink)",fontSize:12},preview:{display:"flex",alignItems:"center",gap:7,padding:11,borderRadius:10,border:"1px solid var(--pix-border)",textDecoration:"none",color:"var(--pix-ink)",fontWeight:800,fontSize:12},
 primary:{minHeight:44,border:0,borderRadius:9,background:"var(--pix-primary)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:900,cursor:"pointer",textDecoration:"none",fontSize:13,boxShadow:"0 8px 18px rgba(182,79,50,.28)"},disabled:{opacity:.55,cursor:"not-allowed",boxShadow:"none"},secondary:{minHeight:42,border:"1px solid var(--pix-border)",borderRadius:9,background:"var(--pix-surface)",color:"var(--pix-ink)",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontWeight:800,cursor:"pointer",textDecoration:"none"},
 error:{padding:13,borderRadius:11,background:"color-mix(in srgb, var(--pix-danger) 8%, var(--pix-surface))",border:"1px solid color-mix(in srgb, var(--pix-danger) 30%, var(--pix-border))",color:"var(--pix-danger)",fontSize:12,display:"grid",gap:4},helper:{color:"var(--pix-muted)",fontSize:10,lineHeight:1.4,textAlign:"center"},trustRow:{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:13,color:"var(--pix-muted)",fontSize:10,fontWeight:800},secureNote:{display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"var(--pix-muted)",fontSize:11},
 pix:{display:"grid",gap:8,textAlign:"center",padding:"18px 22px"},successIcon:{width:44,height:44,borderRadius:"50%",display:"grid",placeItems:"center",background:"var(--pix-canvas)",color:"var(--pix-primary)",margin:"0 auto"},ok:{color:"var(--pix-primary)",fontSize:10,letterSpacing:".12em",fontWeight:900},total:{fontSize:25,color:"var(--pix-ink)"},pixQr:{width:"min(205px,35vh)",height:"min(205px,35vh)",objectFit:"contain",margin:"0 auto",border:"1px solid var(--pix-border)",borderRadius:12,padding:6},
 qrSection:{display:"grid",placeItems:"center",textAlign:"center",gap:8,padding:"20px 22px"},iconCircle:{width:44,height:44,borderRadius:"50%",display:"grid",placeItems:"center",background:"var(--pix-canvas)",color:"var(--pix-primary)"},qrFrame:{position:"relative",width:"min(204px,36vh)",height:"min(204px,36vh)",display:"grid",placeItems:"center",overflow:"hidden",background:"var(--pix-surface)",border:"1px solid var(--pix-border)",borderRadius:14},qrLoading:{color:"var(--pix-muted)",fontSize:12,fontWeight:800},qrError:{position:"absolute",inset:0,padding:18,display:"grid",placeContent:"center",gap:10,background:"var(--pix-surface)",color:"var(--pix-danger)",fontSize:12},bookQr:{position:"absolute",inset:6,width:"calc(100% - 12px)",height:"calc(100% - 12px)",objectFit:"contain",background:"white",transition:"opacity .2s ease"}
};
