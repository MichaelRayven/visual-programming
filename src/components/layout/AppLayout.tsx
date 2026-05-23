import {
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DownloadIcon,
  FileJsonIcon,
  FileSpreadsheetIcon,
  LoaderIcon,
  LogOutIcon,
  MenuIcon,
  SaveIcon,
  UserIcon,
} from "lucide-react";
import { type ChangeEventHandler, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Button } from "@/components/button";
import { MenuContent, MenuItem } from "@/components/menu";
import {
  useDocumentById,
  useDocumentSaveStatus,
  useDocumentStore,
} from "@/hooks/useDocumentStore";
import {
  downloadDocumentFile,
  exportDocToCsv,
  exportDocToJson,
} from "@/lib/document";
import { type RootState } from "@/store";
import { authActions } from "@/store/authSlice";
import { spreadsheetActions } from "@/store/spreadsheetSlice";
import "./AppLayout.css";

export function AppLayout() {
  const { documentId } = useParams<{ documentId: string }>();
  const activeDocument = useDocumentById(documentId || "");
  const saveStatus = useDocumentSaveStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const docStore = useDocumentStore();
  const tableState = useSelector((state: RootState) => state.spreadsheet);
  const user = useSelector((state: RootState) => state.auth.user);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [titleValue, setTitleValue] = useState("");

  useEffect(() => {
    if (activeDocument) {
      setTitleValue(activeDocument.title);
    }
  }, [activeDocument]);

  // Click outside to close user menu dropdown
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isUserMenuOpen]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev: boolean) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", JSON.stringify(next));
      return next;
    });
  };

  const isDocumentPage = location.pathname.startsWith("/documents/");

  const handleTitleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTitleValue(e.target.value);
  };

  const handleTitleBlur = () => {
    const trimmedTitle = titleValue.trim();
    if (!trimmedTitle || !activeDocument) return;
    docStore.updateDocument(activeDocument.id, trimmedTitle);
  };

  const handleSave = () => {
    dispatch(spreadsheetActions.triggerSave());
  };

  const getLiveSnapshot = () => {
    return {
      colWidths: tableState.colWidths,
      rowHeights: tableState.rowHeights,
      gridSize: tableState.gridSize,
      gridSnapshot: tableState.gridSnapshot,
    };
  };

  const handleExportCsv = () => {
    if (!activeDocument) return;
    const liveDoc = { ...activeDocument, tableSnapshot: getLiveSnapshot() };
    const csv = exportDocToCsv(liveDoc);
    downloadDocumentFile(csv, `${activeDocument.title}.csv`, "text/csv");
  };

  const handleExportJson = () => {
    if (!activeDocument) return;
    const liveDoc = { ...activeDocument, tableSnapshot: getLiveSnapshot() };
    const json = exportDocToJson(liveDoc);
    downloadDocumentFile(
      json,
      `${activeDocument.title}.json`,
      "application/json"
    );
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    dispatch(authActions.logout());
  };

  const handleNavigateToProfile = () => {
    setIsUserMenuOpen(false);
    navigate("/profile");
  };

  return (
    <div
      className={`app-container ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      {/* Top Header */}
      <header className="app-header">
        <div className="app-header-left">
          <Button
            variant="ghost"
            className="btn-icon sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Переключить боковую панель"
          >
            <MenuIcon size={20} />
          </Button>

          {/* Dynamic Breadcrumbs & Title Editing */}
          {isDocumentPage && activeDocument ? (
            <div className="header-document-editor">
              <NavLink to="/dashboard" className="breadcrumb-link">
                Мои документы
              </NavLink>
              <span className="breadcrumb-slash">/</span>
              <input
                type="text"
                className="header-document-title-input"
                value={titleValue}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                placeholder="Без названия"
              />
            </div>
          ) : (
            <div className="header-breadcrumbs">
              <NavLink to="/dashboard" className="breadcrumb-link">
                Мои документы
              </NavLink>
              {location.pathname === "/profile" && (
                <>
                  <span className="breadcrumb-slash">/</span>
                  <span className="breadcrumb-current">Профиль</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Spreadsheet Controls in Header */}
        {isDocumentPage && activeDocument && (
          <div className="app-header-center">
            {saveStatus && (
              <div className={`header-save-badge ${saveStatus}`}>
                {saveStatus === "saved" && (
                  <>
                    <CheckCircleIcon size={14} />
                    <span>Сохранено</span>
                  </>
                )}
                {saveStatus === "saving" && (
                  <>
                    <LoaderIcon size={14} className="animate-spin" />
                    <span>Сохранение...</span>
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <AlertCircleIcon size={14} />
                    <span>Ошибка</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div className="app-header-right">
          {isDocumentPage && activeDocument && (
            <div className="header-document-actions">
              <ExportMenu
                onExportCsv={handleExportCsv}
                onExportJson={handleExportJson}
              />
              <Button variant="primary" size="sm" onClick={handleSave}>
                <SaveIcon size={16} />
                Сохранить
              </Button>
            </div>
          )}

          {/* Collapsible Dropdown User Widget */}
          {user && (
            <div ref={userMenuRef} className="header-user-widget-wrapper">
              <button
                type="button"
                className="header-user-widget"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-expanded={isUserMenuOpen}
                aria-label="User profile menu"
              >
                <span className="header-user-name">{user.name}</span>
                <div className="header-user-avatar">
                  <UserIcon size={18} />
                </div>
              </button>

              {isUserMenuOpen && (
                <MenuContent
                  className="menu-dropdown user-dropdown"
                  style={{
                    top: "100%",
                    right: 0,
                    marginTop: "var(--spacing-2)",
                  }}
                >
                  <MenuItem onClick={handleNavigateToProfile}>
                    <UserIcon size={14} />
                    Профиль
                  </MenuItem>
                  <MenuItem onClick={handleLogout} className="menu-item-danger">
                    <LogOutIcon size={14} />
                    Выйти
                  </MenuItem>
                </MenuContent>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Body Wrapper */}
      <div className="app-body-wrapper">
        {/* Collapsible Left Sidebar */}
        <aside className="app-sidebar">
          <nav className="sidebar-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              title="Мои документы"
            >
              <FileSpreadsheetIcon size={20} className="sidebar-link-icon" />
              <span className="sidebar-link-text">Мои документы</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              title="Профиль"
            >
              <UserIcon size={20} className="sidebar-link-icon" />
              <span className="sidebar-link-text">Профиль</span>
            </NavLink>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ExportMenu({
  onExportCsv,
  onExportJson,
}: {
  onExportCsv: () => void;
  onExportJson: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const action = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Export options"
      >
        <DownloadIcon size={16} />
        Экспорт
        <ChevronDownIcon size={14} />
      </Button>
      {open && (
        <MenuContent
          className="menu-dropdown"
          style={{ top: "100%", right: 0, marginTop: "var(--spacing-1)" }}
        >
          <MenuItem onClick={() => action(onExportCsv)}>
            <DownloadIcon size={14} />
            Экспорт в CSV
          </MenuItem>
          <MenuItem onClick={() => action(onExportJson)}>
            <FileJsonIcon size={14} />
            Экспорт в JSON
          </MenuItem>
        </MenuContent>
      )}
    </div>
  );
}
