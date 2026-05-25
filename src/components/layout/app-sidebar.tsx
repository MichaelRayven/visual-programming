import { FileSpreadsheetIcon, UserIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import styles from "./app-sidebar.module.css";

type AppSidebarProps = {
  collapsed: boolean;
};

export function AppSidebar({ collapsed }: AppSidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <nav className={styles.nav}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
          title="Мои документы"
        >
          <FileSpreadsheetIcon size={20} className={styles.icon} />
          <span className={styles.linkText}>Мои документы</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
          title="Профиль"
        >
          <UserIcon size={20} className={styles.icon} />
          <span className={styles.linkText}>Профиль</span>
        </NavLink>
      </nav>
    </aside>
  );
}
