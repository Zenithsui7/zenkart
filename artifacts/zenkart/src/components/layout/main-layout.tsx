import { ReactNode } from "react";
import { TopHeader } from "./top-header";
import { BottomNav } from "./bottom-nav";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <TopHeader />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
