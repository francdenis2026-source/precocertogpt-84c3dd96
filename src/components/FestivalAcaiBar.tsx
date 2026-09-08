import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, X } from "lucide-react";
import { loadActiveCampaigns, type PlatformCampaign } from "../lib/campaigns";
import "./FestivalAcaiBar.css";

const dismissKey = (campaignId: string) => `pc:campaign-dismissed:${campaignId}`;
const wasDismissed = (campaignId: string) => {
  try { return sessionStorage.getItem(dismissKey(campaignId)) === "1"; }
  catch { return false; }
};

// O nome é mantido para compatibilidade. O conteúdo agora vem do gestor de
// campanhas. O fechamento vale somente para a sessão da aba: sobrevive a
// recarregamentos, mas não é propagado para uma nova aba ou nova sessão.
export function FestivalAcaiBar() {
  const [campaign, setCampaign] = useState<PlatformCampaign|null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let mounted=true;
    const refresh=()=>{void loadActiveCampaigns().then(rows=>{if(!mounted)return;const next=rows[0]||null;setCampaign(next);setHidden(Boolean(next&&wasDismissed(next.id)))})};
    refresh();window.addEventListener('pc:campaigns-changed',refresh);
    return()=>{mounted=false;window.removeEventListener('pc:campaigns-changed',refresh)};
  }, []);

  const closeBanner = () => {
    if (!campaign) return;
    setHidden(true);
    try { sessionStorage.setItem(dismissKey(campaign.id), "1"); }
    catch { /* o estado em memória ainda fecha o banner nesta visualização */ }
  };

  if (!campaign || hidden) return null;
  // Banner já pronto (arte com texto/CTA desenhados na própria imagem):
  // mostra só a imagem, sem véu nem título por cima, senão duplica o texto.
  const bareImage=Boolean(campaign.imageUrl&&campaign.imageHasText);
  const content=bareImage
    ? <img src={campaign.imageUrl!} width="1024" height="62" alt={campaign.title}/>
    : <>{campaign.imageUrl&&<img src={campaign.imageUrl} width="1024" height="62" alt="" aria-hidden="true"/>}<span><i><Megaphone aria-hidden="true"/></i><b><strong>{campaign.title}</strong>{campaign.subtitle&&<small>{campaign.subtitle}</small>}</b><em>{campaign.linkLabel}</em></span></>;
  const external=/^https?:\/\//i.test(campaign.linkUrl);
  const artClass=`pc-festival-bar__art${campaign.imageUrl&&!bareImage?' has-image':''}${bareImage?' is-bare-image':''}`;
  const artStyle=(campaign.imagePosition||campaign.imageScale!==100)?{
    ['--campaign-focus' as string]:campaign.imagePosition||'center',
    ['--campaign-scale' as string]:`${(campaign.imageScale||100)/100}`,
  }:undefined;
  return <div className={`pc-festival-bar theme-${campaign.theme} kind-${campaign.kind}`} role="region" aria-label={campaign.title}>
    {external?<a className={artClass} style={artStyle} href={campaign.linkUrl} target="_blank" rel="noreferrer">{content}</a>:<Link className={artClass} style={artStyle} to={campaign.linkUrl||'/buscar'}>{content}</Link>}
    {campaign.isDismissible&&<button type="button" className="pc-festival-bar__close" onClick={closeBanner} aria-label="Fechar banner"><X aria-hidden="true"/></button>}
  </div>;
}
