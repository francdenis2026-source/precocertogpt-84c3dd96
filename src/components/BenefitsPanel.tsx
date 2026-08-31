import type { LucideIcon } from "lucide-react";
import "./BenefitsPanel.css";

export type BenefitItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function BenefitsPanel({ items }: { items: BenefitItem[] }) {
  return (
    <div className="pc-benefits-panel" aria-label="Vantagens">
      {items.map(({ icon: Icon, title, description }) => (
        <div className="pc-benefits-panel__item" key={title}>
          <span className="pc-benefits-panel__icon" aria-hidden="true">
            <Icon />
          </span>
          <span className="pc-benefits-panel__copy">
            <strong>{title}</strong>
            <small>{description}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
