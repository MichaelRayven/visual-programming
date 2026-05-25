import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "@/components/toast";
import { AppHeader } from "./app-header";
import styles from "./app-layout.module.css";
import { AppSidebar } from "./app-sidebar";

export function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev: boolean) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className={styles.container}>
      <AppHeader
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />
      <div className={styles.bodyWrapper}>
        <AppSidebar collapsed={isSidebarCollapsed} />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
