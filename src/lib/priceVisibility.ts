import { supabase } from './supabase';
import { loadSessionProfile } from './roles';

export const PRICE_VISIBILITY_EVENT = 'pc:price-visibility-changed';

const FALLBACK = false;

export async function loadAllPricesVisible(): Promise<boolean> {
  if (!supabase) return FALLBACK;
  const { data, error } = await supabase.from('platform_settings').select('all_prices_visible').eq('id', 'global').maybeSingle();
  if (error || !data) return FALLBACK;
  return Boolean(data.all_prices_visible);
}

export async function setAllPricesVisible(enabled: boolean) {
  if (!supabase) return { error: 'Banco não configurado.' };
  const profile = await loadSessionProfile(true);
  if (!profile?.isAdmin) return { error: 'Somente administradores podem alterar essa configuração.' };
  const { error } = await supabase.from('platform_settings').update({
    all_prices_visible: enabled,
    updated_at: new Date().toISOString(),
    updated_by: profile.userId,
  }).eq('id', 'global');
  if (!error && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<boolean>(PRICE_VISIBILITY_EVENT, { detail: enabled }));
  return { error: error?.message ?? null };
}

/* Supabase Realtime não permite registrar um novo listener `postgres_changes`
 * num canal que já chamou `.subscribe()` — o cliente lança "cannot add
 * `postgres_changes` callbacks... after subscribe()". Como usePriceVisibility
 * agora pode montar em mais de um lugar ao mesmo tempo na mesma página (ex.:
 * a busca compacta do header + a busca do herói, ambas na home), um canal
 * novo por chamada quebrava a segunda montagem. Aqui o canal é um singleton
 * de módulo, criado e assinado uma única vez e compartilhado por todos os
 * assinantes.
 *
 * De propósito ele nunca é removido quando o último assinante sai: em
 * StrictMode (dev) o React monta, desmonta e remonta o componente de
 * propósito para pegar bugs — se o canal fosse removido nesse intervalo,
 * o remontar imediato recriava um canal com o MESMO nome de tópico antes do
 * `removeChannel` assíncrono terminar, e o cliente Supabase reaproveitava a
 * instância antiga (já inscrita), disparando o mesmo erro. Manter um único
 * canal vivo pelo tempo de vida da aba é o comportamento correto aqui: é um
 * canal pequeno (só a linha `platform_settings`) e compartilhado por toda a
 * página, então o custo de mantê-lo aberto é desprezível. */
let sharedChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
const sharedChannelListeners = new Set<(enabled: boolean) => void>();

function ensureSharedChannel() {
  if (sharedChannel || !supabase) return;
  sharedChannel = supabase
    .channel('platform-settings-price-visibility')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'platform_settings', filter: 'id=eq.global' }, payload => {
      const next = (payload.new as { all_prices_visible?: boolean } | null)?.all_prices_visible;
      if (typeof next === 'boolean') for (const listener of sharedChannelListeners) listener(next);
    })
    .subscribe();
}

/** Assina alterações em tempo real (Supabase Realtime) e no mesmo aba (evento local). Retorna a função de cancelamento. */
export function subscribePriceVisibility(onChange: (enabled: boolean) => void): () => void {
  const handleLocalEvent = (event: Event) => {
    const detail = (event as CustomEvent<boolean>).detail;
    if (typeof detail === 'boolean') onChange(detail);
  };
  window.addEventListener(PRICE_VISIBILITY_EVENT, handleLocalEvent);

  if (!supabase) return () => window.removeEventListener(PRICE_VISIBILITY_EVENT, handleLocalEvent);

  ensureSharedChannel();
  sharedChannelListeners.add(onChange);

  return () => {
    window.removeEventListener(PRICE_VISIBILITY_EVENT, handleLocalEvent);
    sharedChannelListeners.delete(onChange);
  };
}
