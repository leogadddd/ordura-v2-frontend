import { PropsWithChildren } from "react";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <TopBar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-2 md:p-4 pb-0!">
          <div className="rounded-t-2xl overflow-hidden border border-b-0 border-primary-pale bg-white/90 shadow-sm min-h-[calc(100vh-88px)] h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
