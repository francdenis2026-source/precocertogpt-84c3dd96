import type { ReactNode } from "react";

// The previous implementation blocked the whole application whenever another
// tab owned a short-lived browser lease. That behavior interfered with Lovable
// preview/editor sessions and could make the public site appear unavailable.
// Keep the component as a compatibility boundary, but never gate rendering.
export function SingleBrowserTabGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
