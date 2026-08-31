import { Tag } from "lucide-react";
import "./ProductHeroBand.css";

export function ProductHeroBand({ category }: { category?: string }) {
  return (
    <section className="pdx-hero-band" aria-hidden="true">
      <svg className="pdx-hero-band__art" viewBox="0 0 1280 220" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="pdxHeroGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0b2d22" />
            <stop offset="55%" stopColor="#123f2f" />
            <stop offset="100%" stopColor="#1a5a41" />
          </linearGradient>
          <radialGradient id="pdxHeroGlow" cx="82%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#3ecb82" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3ecb82" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1280" height="220" fill="url(#pdxHeroGrad)" />
        <rect width="1280" height="220" fill="url(#pdxHeroGlow)" />
        <g stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1">
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1={i * 100 - 80} y1="0" x2={i * 100 + 140} y2="220" />
          ))}
        </g>
        <g opacity="0.9">
          <rect x="86" y="54" width="46" height="24" rx="6" fill="#ffffff" fillOpacity="0.08" />
          <rect x="150" y="120" width="60" height="24" rx="6" fill="#3ecb82" fillOpacity="0.18" />
          <rect x="1040" y="46" width="52" height="24" rx="6" fill="#ffffff" fillOpacity="0.08" />
          <rect x="1120" y="110" width="64" height="24" rx="6" fill="#3ecb82" fillOpacity="0.22" />
        </g>
      </svg>
      {category && (
        <div className="pdx-hero-band__tag">
          <Tag aria-hidden="true" />
          <span>{category}</span>
        </div>
      )}
    </section>
  );
}
