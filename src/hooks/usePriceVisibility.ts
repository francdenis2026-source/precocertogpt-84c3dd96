import { useEffect, useState } from 'react';
import { loadAllPricesVisible, subscribePriceVisibility } from '../lib/priceVisibility';

/** Verdadeiro quando o admin liberou a visualização de todos os preços para visitantes não cadastrados. */
export function usePriceVisibility() {
  const [allPricesVisible, setAllPricesVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadAllPricesVisible().then(value => { if (active) { setAllPricesVisible(value); setLoading(false); } });
    const unsubscribe = subscribePriceVisibility(value => { if (active) setAllPricesVisible(value); });
    return () => { active = false; unsubscribe(); };
  }, []);

  return { allPricesVisible, loading };
}
