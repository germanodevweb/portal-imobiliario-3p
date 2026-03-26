/**
 * Cotação EUR/BRL — camada centralizada com cache e fallback.
 * Fonte: Frankfurter.app (ECB reference rates, gratuito, sem API key).
 */

import { cache } from "react";

const FRANKFURTER_URL = "https://api.frankfurter.app/latest?from=EUR&to=BRL";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora
const FALLBACK_RATE = 6.0;

type CacheEntry = {
  rate: number;
  fetchedAt: number;
};

let memoryCache: CacheEntry | null = null;

async function fetchEurToBrlFromApi(): Promise<number> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const res = await fetch(FRANKFURTER_URL, {
    signal: controller.signal,
    next: { revalidate: 3600 },
  });
  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`Exchange rate API returned ${res.status}`);
  }

  const data = (await res.json()) as { rates?: { BRL?: number } };
  const rate = data.rates?.BRL;

  if (typeof rate !== "number" || rate <= 0) {
    throw new Error("Invalid rate in API response");
  }

  return rate;
}

/**
 * Obtém cotação EUR/BRL com cache em memória (TTL 1h) e fallback estático.
 * Usa React cache() para deduplicar por request.
 */
export const getEurToBrlRate = cache(async (): Promise<number> => {
  const now = Date.now();
  if (memoryCache && now - memoryCache.fetchedAt < CACHE_TTL_MS) {
    return memoryCache.rate;
  }

  try {
    const rate = await fetchEurToBrlFromApi();
    memoryCache = { rate, fetchedAt: now };
    return rate;
  } catch {
    if (memoryCache) {
      return memoryCache.rate;
    }
    return FALLBACK_RATE;
  }
});
