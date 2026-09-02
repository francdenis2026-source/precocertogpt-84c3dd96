import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { adminRoles, invalidateSessionProfile, type AppRole } from "../lib/roles";

export type AuthResult = { error: string | null };

export type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isMerchant: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
};

const merchantRoles: AppRole[] = ["merchant_owner", "merchant_staff"];

const AuthContext = createContext<AuthState | null>(null);

function messageFor(raw: string | undefined): string {
  const text = (raw || "").toLocaleLowerCase("pt-BR");
  if (text.includes("invalid login") || text.includes("invalid credentials"))
    return "E-mail ou senha incorretos. Confira os dados ou crie sua conta.";
  if (text.includes("email not confirmed")) return "Confirme seu e-mail para concluir o acesso.";
  if (text.includes("user already registered")) return "Já existe uma conta com este e-mail. Faça login.";
  if (text.includes("password")) return "A senha precisa ter pelo menos 6 caracteres.";
  return raw || "Não foi possível concluir a operação. Tente novamente.";
}

/**
 * Papéis vindos de fonte segura: `app_metadata` do JWT (definido no servidor)
 * e a tabela `user_roles` protegida por RLS. `user_metadata` é ignorado de
 * propósito — é editável pelo próprio usuário.
 */
async function fetchRoles(user: User | null): Promise<AppRole[]> {
  if (!user || !supabase) return [];
  const fromToken = new Set<AppRole>();
  const meta = user.app_metadata as Record<string, unknown> | undefined;
  const metaRoles = [meta?.roles, meta?.role].flat();
  for (const value of metaRoles) if (typeof value === "string") fromToken.add(value as AppRole);
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!error && data) for (const row of data) if (row?.role) fromToken.add(row.role as AppRole);
  return Array.from(fromToken);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);

  const applySession = useCallback(async (next: Session | null) => {
    if (!alive.current) return;
    setSession(next);
    const nextRoles = await fetchRoles(next?.user ?? null);
    if (!alive.current) return;
    setRoles(nextRoles);
    setLoading(false);
  }, []);

  useEffect(() => {
    alive.current = true;
    if (!supabase) {
      setLoading(false);
      return () => {
        alive.current = false;
      };
    }
    void supabase.auth.getSession().then(({ data }) => void applySession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession ?? null);
    });
    const onLegacyChange = () => {
      if (!supabase) return;
      void supabase.auth.getSession().then(({ data }) => void applySession(data.session ?? null));
    };
    window.addEventListener("pc:auth-changed", onLegacyChange);
    return () => {
      alive.current = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("pc:auth-changed", onLegacyChange);
    };
  }, [applySession]);

  const announce = useCallback(() => {
    invalidateSessionProfile();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("pc:auth-changed"));
  }, []);

  const signInWithPassword = useCallback<AuthState["signInWithPassword"]>(async (email, password) => {
    if (!supabase) return { error: "Autenticação indisponível: banco não configurado." };
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLocaleLowerCase("pt-BR"),
      password,
    });
    if (error || !data.session) return { error: messageFor(error?.message) };
    await applySession(data.session);
    announce();
    return { error: null };
  }, [announce, applySession]);

  const signUp = useCallback<AuthState["signUp"]>(async (email, password, name) => {
    if (!supabase) return { error: "Cadastro indisponível: banco não configurado." };
    const cleanName = (name || "").trim();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLocaleLowerCase("pt-BR"),
      password,
      options: { data: { name: cleanName, full_name: cleanName }, emailRedirectTo: window.location.origin },
    });
    if (error) return { error: messageFor(error.message) };
    if (data.session) await applySession(data.session);
    announce();
    return { error: null };
  }, [announce, applySession]);

  const signOutFn = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    if (alive.current) {
      setSession(null);
      setRoles([]);
      setLoading(false);
    }
    announce();
  }, [announce]);

  const refreshRoles = useCallback(async () => {
    const nextRoles = await fetchRoles(session?.user ?? null);
    if (alive.current) setRoles(nextRoles);
  }, [session]);

  const value = useMemo<AuthState>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    roles,
    isAdmin: roles.some(role => adminRoles.includes(role)),
    isMerchant: roles.some(role => merchantRoles.includes(role)),
    signInWithPassword,
    signUp,
    signOut: signOutFn,
    refreshRoles,
  }), [session, loading, roles, signInWithPassword, signUp, signOutFn, refreshRoles]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return context;
}

export { merchantRoles };
