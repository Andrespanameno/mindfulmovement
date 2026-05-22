import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[480px] mx-auto pb-28 px-6 pt-12">{children}</div>
      <BottomNav />
    </div>
  );
}