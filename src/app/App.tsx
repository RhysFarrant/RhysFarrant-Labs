import { Outlet } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import PanelHeader from "@/components/layout/PanelHeader";

export default function App() {
  return (
    <div className="page-gradient flex h-dvh flex-col overflow-hidden">
      <Header />

      <main className="mx-auto flex w-full max-w-[1140px] min-h-0 flex-1 p-3 sm:p-4">
        <div className="floating-panel flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/30">
          <PanelHeader />
          <div className="panel-scroll min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
