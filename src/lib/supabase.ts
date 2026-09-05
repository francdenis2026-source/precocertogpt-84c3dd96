// Cliente Supabase do PreçoCerto — projeto externo e independente.
// A URL e a chave publicável são valores públicos por design (a proteção real é RLS).
// A senha do banco / service_role NUNCA devem aparecer no frontend.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Projeto externo obrigatório. Qualquer outro id (inclusive bancos antigos) é ignorado. */
export const SUPABASE_PROJECT_ID = "kqueiohjadwzxafdrrxk";
const OFFICIAL_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

const configuredUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;

// Só aceita a URL do ambiente quando ela aponta para o projeto correto:
// assim uma variável antiga não volta a conectar no banco errado.
export const SUPABASE_URL =
  configuredUrl && configuredUrl.includes(SUPABASE_PROJECT_ID) ? configuredUrl : OFFICIAL_URL;

export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/**
 * Instância única do cliente. Retorna `null` quando as credenciais não estão
 * definidas, para que a interface possa cair no catálogo local sem quebrar.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
