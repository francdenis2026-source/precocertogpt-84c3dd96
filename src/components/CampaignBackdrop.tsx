/** Decorative generated photography; each background stays inside its own hero. */
export function CampaignBackdrop({ scene }: { scene: "home-shopping" | "business" }) {
  return <div className="pc-campaign-backdrop" aria-hidden="true">
    <img src={`/editorial-2026/${scene}-1280.webp`}
      srcSet={`/editorial-2026/${scene}-640.webp 640w, /editorial-2026/${scene}-1280.webp 1280w`}
      sizes="(max-width: 760px) 100vw, 740px" alt="" width="1536" height="1024"
      fetchPriority="high" loading="eager" decoding="async" />
  </div>;
}
