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

/** Assina alterações em tempo real (Supabase Realtime) e no mesmo aba (evento local). Retorna a função de cancelamento. */
export function subscribePriceVisibility(onChange: (enabled: boolean) => void): () => void {
  const handleLocalEvent = (event: Event) => {
    const detail = (event as CustomEvent<boolean>).detail;
    if (typeof detail === 'boolean') onChange(detail);
  };
  window.addEventListener(PRICE_VISIBILITY_EVENT, handleLocalEvent);

  if (!supabase) return () => window.removeEventListener(PRICE_VISIBILITY_EVENT, handleLocalEvent);

  const channel = supabase
    .channel('platform-settings-price-visibility')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'platform_settings', filter: 'id=eq.global' }, payload => {
      const next = (payload.new as { all_prices_visible?: boolean } | null)?.all_prices_visible;
      if (typeof next === 'boolean') onChange(next);
    })
    .subscribe();

  return () => {
    window.removeEventListener(PRICE_VISIBILITY_EVENT, handleLocalEvent);
    void supabase?.removeChannel(channel);
  };
}
