import {
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DownloadIcon,
  FileJsonIcon,
  FileSpreadsheetIcon,
  LogOutIcon,
  MenuIcon,
  SaveIcon,
  UserIcon,
} from "lucide-react";
import { type ChangeEventHandler, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Button } from "@/components/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Dropdown, MenuItem } from "@/components/menu";
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
import { type RootState, useAppDispatch } from "@/store";
import { logoutUser } from "@/store/authSlice";
import { documentsActions } from "@/store/documentsSlice";
import { spreadsheetActions } from "@/store/spreadsheetSlice";
import "./AppLayout.css";

export function AppLayout() {
  const { documentId } = useParams<{ documentId: string }>();
  const activeDocument = useDocumentById(documentId || "");
  const saveStatus = useDocumentSaveStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const docStore = useDocumentStore();
  const tableState = useSelector((state: RootState) => state.spreadsheet);
  const user = useSelector((state: RootState) => state.auth.user);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [titleValue, setTitleValue] = useState("");

  useEffect(() => {
    if (activeDocument) {
      setTitleValue(activeDocument.title);
    }
  }, [activeDocument]);

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
    dispatch(logoutUser());
    dispatch(documentsActions.clearDocuments());
  };

  const handleNavigateToProfile = () => {
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
                    <LoadingSpinner size={14} />
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
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="header-user-widget"
                  aria-label="User profile menu"
                >
                  <span className="header-user-name">{user.name}</span>
                  <div className="header-user-avatar">
                    <UserIcon size={18} />
                  </div>
                </button>
              }
              menuClassName="user-dropdown"
            >
              <MenuItem onClick={handleNavigateToProfile}>
                <UserIcon size={14} />
                Профиль
              </MenuItem>
              <MenuItem danger onClick={handleLogout}>
                <LogOutIcon size={14} />
                Выйти
              </MenuItem>
            </Dropdown>
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
  return (
    <Dropdown
      trigger={
        <Button variant="outline" size="sm" aria-label="Export options">
          <DownloadIcon size={16} />
          Экспорт
          <ChevronDownIcon size={14} />
        </Button>
      }
    >
      <MenuItem onClick={onExportCsv}>
        <DownloadIcon size={14} />
        Экспорт в CSV
      </MenuItem>
      <MenuItem onClick={onExportJson}>
        <FileJsonIcon size={14} />
        Экспорт в JSON
      </MenuItem>
    </Dropdown>
  );
}
