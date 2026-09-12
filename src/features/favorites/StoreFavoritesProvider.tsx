import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { requestAuthAction } from "../../lib/authActionPrompt";

type StoreFavoriteContextValue = {
  favoriteStoreIds: string[];
  loading: boolean;
  isStoreFavorite: (establishmentId: string | number) => boolean;
  toggleStoreFavorite: (establishmentId: string | number, returnTo?: string) => Promise<boolean>;
  refreshStoreFavorites: () => Promise<void>;
};

const StoreFavoritesContext = createContext<StoreFavoriteContextValue | null>(null);
const COMPAT_KEY = "precocerto:favorite_stores";

function userCacheKey(userId: string) {
  return `${COMPAT_KEY}:${userId}`;
}

function readCompatibility(userId: string): string[] {
  try {
    const raw = localStorage.getItem(userCacheKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveCompatibility(ids: string[], userId?: string) {
  try {
    if (userId) localStorage.setItem(userCacheKey(userId), JSON.stringify(ids));
  } catch { /* compatibilidade opcional */ }
}

export function StoreFavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteStoreIds, setFavoriteStoreIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadForUser = useCallback(async (id: string | null) => {
    if (!supabase || !id) {
      setFavoriteStoreIds([]);
      setLoading(false);
      return;
    }

    const cachedIds = readCompatibility(id);
    setFavoriteStoreIds(cachedIds);
    const { data, error } = await supabase
      .from("user_favorite_establishments")
      .select("establishment_id")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (!error) {
      const ids = (data ?? []).map(row => String(row.establishment_id));
      setFavoriteStoreIds(ids);
      saveCompatibility(ids, id);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let active = true;

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      await loadForUser(data.session?.user?.id ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null;
      setTimeout(() => { void loadForUser(id); }, 0);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadForUser]);

  const refreshStoreFavorites = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    await loadForUser(data.session?.user?.id ?? null);
  }, [loadForUser]);

  const toggleStoreFavorite = useCallback(async (establishmentId: string | number, returnTo?: string) => {
    const id = String(establishmentId);
    if (!supabase) return false;

    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;
    if (!sessionUser) {
      const destination = returnTo || `${window.location.pathname}${window.location.search}`;
      requestAuthAction("favorite", destination);
      return false;
    }

    const removing = favoriteStoreIds.includes(id);
    const next = removing ? favoriteStoreIds.filter(value => value !== id) : [id, ...favoriteStoreIds.filter(value => value !== id)];
    setFavoriteStoreIds(next);
    saveCompatibility(next, sessionUser.id);

    const response = removing
      ? await supabase.from("user_favorite_establishments").delete().eq("user_id", sessionUser.id).eq("establishment_id", id)
      : await supabase.from("user_favorite_establishments").insert({ user_id: sessionUser.id, establishment_id: id });

    if (response.error && response.error.code !== "23505") {
      await loadForUser(sessionUser.id);
      window.dispatchEvent(new CustomEvent("pc:set-toast", { detail: { message: "Não foi possível atualizar suas lojas favoritas agora." } }));
      return false;
    }

    window.dispatchEvent(new CustomEvent("pc:set-toast", {
      detail: { message: removing ? "Loja removida dos favoritos." : "Loja salva nos favoritos." },
    }));
    return true;
  }, [favoriteStoreIds, loadForUser]);

  const value = useMemo<StoreFavoriteContextValue>(() => ({
    favoriteStoreIds,
    loading,
    isStoreFavorite: (establishmentId) => favoriteStoreIds.includes(String(establishmentId)),
    toggleStoreFavorite,
    refreshStoreFavorites,
  }), [favoriteStoreIds, loading, toggleStoreFavorite, refreshStoreFavorites]);

  return <StoreFavoritesContext.Provider value={value}>{children}</StoreFavoritesContext.Provider>;
}

export function useStoreFavorites() {
  const context = useContext(StoreFavoritesContext);
  if (!context) throw new Error("useStoreFavorites precisa estar dentro de StoreFavoritesProvider");
  return context;
}
