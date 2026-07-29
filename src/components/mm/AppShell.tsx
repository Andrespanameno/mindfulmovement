import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="max-w-[480px] mx-auto px-6"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 3rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 7rem)",
        }}
      >
        {children}
      </div>
      <BottomNav />
    </div>
  );
}