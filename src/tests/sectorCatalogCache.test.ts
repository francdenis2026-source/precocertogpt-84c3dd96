// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const fetchMock = vi.hoisted(() => vi.fn());
vi.mock("../data/remoteCatalog", () => ({ fetchCatalog: fetchMock }));
vi.mock("../lib/supabase", () => ({ supabase: null }));
const payload = { products: [], stores: [], metrics: { products: 0, stores: 0, prices: 0 }, updatedAt: "2026-09-11T00:00:00Z", source: "supabase" };
beforeEach(() => { vi.resetModules(); fetchMock.mockReset(); sessionStorage.clear(); vi.useFakeTimers(); fetchMock.mockResolvedValue(payload); });
afterEach(() => vi.useRealTimers());
describe("Public catalogue caching", () => {
  it("coalesces concurrent requests and reuses fresh data", async () => {
    const { fetchSectorCatalog } = await import("../data/sectorCatalog");
    await Promise.all([fetchSectorCatalog(), fetchSectorCatalog()]);
    await fetchSectorCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("restores a session snapshot without another database request", async () => {
    const first = await import("../data/sectorCatalog");
    await first.fetchSectorCatalog();
    vi.resetModules();
    const second = await import("../data/sectorCatalog");
    expect(second.getCachedSectorCatalog()).not.toBeNull();
    await second.fetchSectorCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("refreshes after five minutes and preserves the snapshot on failure", async () => {
    const api = await import("../data/sectorCatalog");
    const saved = await api.fetchSectorCatalog();
    vi.advanceTimersByTime(5 * 60_000 + 1);
    fetchMock.mockResolvedValue({ ...payload, error: "offline" });
    await expect(api.fetchSectorCatalog()).rejects.toThrow();
    expect(api.getCachedSectorCatalog()).toEqual(saved);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
