import { PropsWithChildren } from "react";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/sidebar/Sidebar";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen bg-gray-100 text-gray-900 flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-hidden p-0 md:p-3 !pb-0 h-full flex flex-col">
          <div className=" md:rounded-t-2xl overflow-hidden h-full border border-b-0 border-primary-pale bg-white/90 shadow-sm flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
