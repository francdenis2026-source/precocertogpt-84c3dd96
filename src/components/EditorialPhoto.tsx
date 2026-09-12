/** Generated illustrative photography, never presented as a real shop. */
export function EditorialPhoto({ scene, className = "", priority = false }: {
  scene: "receipt" | "business"; className?: string; priority?: boolean;
}) {
  return <figure className={`pc-editorial-photo ${className}`}>
    <img src={`/editorial-2026/${scene}-1280.webp`}
      srcSet={`/editorial-2026/${scene}-640.webp 640w, /editorial-2026/${scene}-1280.webp 1280w`}
      sizes="(max-width: 760px) calc(100vw - 32px), 480px"
      alt="" width="1536" height="1024" loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"} decoding="async" />
    <figcaption>Imagem ilustrativa gerada por IA</figcaption>
  </figure>;
}
