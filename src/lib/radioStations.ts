import { supabase } from "./supabase";
import { loadSessionProfile } from "./roles";

export type RadioStation = {
  id: string;
  name: string;
  stream_url: string;
  fallback_url: string | null;
  metadata_url: string | null;
  is_active: boolean;
  is_enabled: boolean;
  updated_at?: string;
};

export const DEFAULT_RADIO: RadioStation = {
  id: "default-jovem-pan",
  name: "Jovem Pan FM",
  stream_url: "https://stream.zeno.fm/c45wbq2us3buv",
  fallback_url: "https://stream-284.zeno.fm/c45wbq2us3buv",
  metadata_url: "https://api.zeno.fm/mounts/metadata/subscribe/c45wbq2us3buv",
  is_active: true,
  is_enabled: true,
};

/**
 * A estação ativa é a mesma para toda a sessão de navegação.
 * Sem cache/dedupe, cada montagem do player refazia a consulta e, quando a
 * tabela não é legível publicamente, gerava requisições 401 repetidas.
 */
let activeRadioCache: RadioStation | null = null;
let activeRadioRequest: Promise<RadioStation> | null = null;

async function requestActiveRadio(): Promise<RadioStation> {
  if (!supabase) return DEFAULT_RADIO;
  const { data, error } = await supabase
    .from("radio_stations")
    .select(
      "id,name,stream_url,fallback_url,metadata_url,is_active,is_enabled,updated_at",
    )
    .eq("is_active", true)
    .eq("is_enabled", true)
    .limit(1)
    .maybeSingle();
  return error || !data ? DEFAULT_RADIO : (data as RadioStation);
}

export async function loadActiveRadio(): Promise<RadioStation> {
  if (import.meta.env.MODE === "test") return DEFAULT_RADIO;
  if (activeRadioCache) return activeRadioCache;
  if (!activeRadioRequest) {
    activeRadioRequest = requestActiveRadio()
      .then((station) => {
        activeRadioCache = station;
        return station;
      })
      .catch(() => DEFAULT_RADIO)
      .finally(() => {
        activeRadioRequest = null;
      });
  }
  return activeRadioRequest;
}

/** Usado quando o admin troca a estação ativa. */
export function invalidateActiveRadioCache() {
  activeRadioCache = null;
  activeRadioRequest = null;
}

export async function loadAdminRadios(): Promise<RadioStation[]> {
  if (!supabase || !(await loadSessionProfile(true))?.isAdmin) return [];
  const { data, error } = await supabase
    .from("radio_stations")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name");
  if (error) throw error;
  return (data ?? []) as RadioStation[];
}

export async function saveAdminRadio(
  value: Partial<RadioStation> & Pick<RadioStation, "name" | "stream_url">,
) {
  if (!supabase) return { error: "Banco não configurado." };
  const payload = {
    name: value.name.trim(),
    stream_url: value.stream_url.trim(),
    fallback_url: value.fallback_url?.trim() || null,
    metadata_url: value.metadata_url?.trim() || null,
    is_enabled: value.is_enabled !== false,
  };
  const request =
    value.id && value.id !== "new"
      ? supabase.from("radio_stations").update(payload).eq("id", value.id)
      : supabase.from("radio_stations").insert(payload);
  const { error } = await request;
  return { error: error?.message ?? null };
}

export async function activateAdminRadio(id: string) {
  if (!supabase) return { error: "Banco não configurado." };
  const { error } = await supabase.rpc("admin_activate_radio", {
    _station_id: id,
  });
  if (!error) invalidateActiveRadioCache();
  if (!error && typeof window !== "undefined")
    window.dispatchEvent(new Event("pc:radio-config-changed"));
  return { error: error?.message ?? null };
}

export async function deleteAdminRadio(id: string) {
  if (!supabase) return { error: "Banco não configurado." };
  const { error } = await supabase.from("radio_stations").delete().eq("id", id);
  return { error: error?.message ?? null };
}
