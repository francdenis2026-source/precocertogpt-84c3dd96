import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type StoreAvailability = {
  establishmentId: string;
  establishmentSlug: string;
  merchantId: string;
  serviceLive: boolean;
  activeProductIds: Set<string>;
};

type AvailabilityRow = {
  establishment_id: string;
  establishment_slug: string;
  merchant_id: string;
  service_live: boolean;
  active_product_ids: string[];
};

let cache: Map<string, StoreAvailability> | null = null;
let pending: Promise<Map<string, StoreAvailability>> | null = null;

async function loadAvailability(): Promise<Map<string, StoreAvailability>> {
  if (cache) return cache;
  if (pending) return pending;
  pending = (async () => {
    const map = new Map<string, StoreAvailability>();
    if (!supabase) {
      cache = map;
      return map;
    }
    const { data, error } = await supabase.rpc("marketplace_public_availability");
    if (!error && data) {
      for (const row of data as AvailabilityRow[]) {
        const entry: StoreAvailability = {
          establishmentId: row.establishment_id,
          establishmentSlug: row.establishment_slug,
          merchantId: row.merchant_id,
          serviceLive: row.service_live,
          activeProductIds: new Set((row.active_product_ids || []).map(String)),
        };
        map.set(row.establishment_id, entry);
        map.set(row.establishment_slug, entry);
      }
    }
    cache = map;
    return map;
  })();
  try {
    return await pending;
  } finally {
    pending = null;
  }
}

/** Leitura direta e síncrona do cache (undefined se ainda não carregou). */
export function getCachedAvailability(establishmentId: string | number): StoreAvailability | undefined {
  return cache?.get(String(establishmentId));
}

/** Diz se um produto pode ser comprado online agora, e por qual loja. */
export function useProductOnlineSales(productId: string | number, establishmentId: string | number, establishmentSlug?: string) {
  const [availability, setAvailability] = useState<Map<string, StoreAvailability> | null>(cache);

  useEffect(() => {
    if (cache) return;
    let active = true;
    void loadAvailability().then((map) => {
      if (active) setAvailability(map);
    });
    return () => {
      active = false;
    };
  }, []);

  const store = availability?.get(String(establishmentId)) || (establishmentSlug ? availability?.get(establishmentSlug) : undefined);
  const canBuyOnline = Boolean(store?.serviceLive && store.activeProductIds.has(String(productId)));
  return { canBuyOnline, merchantId: store?.merchantId };
}
