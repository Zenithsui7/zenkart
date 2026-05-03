import { ReactNode } from "react";
import { TopHeader } from "./top-header";
import { BottomNav } from "./bottom-nav";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <TopHeader />
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
