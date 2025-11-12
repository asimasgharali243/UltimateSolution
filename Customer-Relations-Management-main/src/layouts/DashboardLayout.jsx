import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/navbar/Navbar";
import { AppSidebar } from "../components/sidebar/AppSidebar";

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar isCollapsed={isSidebarCollapsed} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
