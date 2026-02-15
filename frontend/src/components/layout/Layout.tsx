import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import cn from "classnames";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          // Main content is offset by the sidebar width on desktop,
          // and resets to full width on tablet/mobile where the
          // sidebar overlays instead of pushing content.
          "flex-1 transition-[margin-left] duration-300 ease-in-out max-lg:ml-0",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        )}
      >
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 py-4 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
