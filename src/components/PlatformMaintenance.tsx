import type { ReactNode } from "react";

// Maintenance mode is intentionally non-blocking while the site is under
// active redesign. Keeping these exports preserves existing imports without
// allowing a remote flag to replace the public interface during Lovable work.
export function PlatformMaintenanceGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function AdminMaintenanceControl() {
  return null;
}
