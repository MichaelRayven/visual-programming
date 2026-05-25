import {
  ChevronDownIcon,
  DownloadIcon,
  FileJsonIcon,
  LogOutIcon,
  MenuIcon,
  SaveIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dropdown, MenuItem } from "@/components/ui/menu";
import { useDocumentById, useDocumentStore } from "@/hooks/useDocumentStore";
import {
  downloadDocumentFile,
  exportDocToCsv,
  exportDocToJson,
} from "@/lib/document";
import { store as reduxStore, useAppDispatch, useAppSelector } from "@/store";
import { logoutUser } from "@/store/authSlice";
import { documentsActions } from "@/store/documentsSlice";
import { spreadsheetActions } from "@/store/spreadsheetSlice";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import styles from "./app-header.module.css";

type AppHeaderProps = {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const { documentId } = useParams<{ documentId: string }>();
  const activeDocument = useDocumentById(documentId || "");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const docStore = useDocumentStore();
  const user = useAppSelector((state) => state.auth.user);

  const [titleValue, setTitleValue] = useState("");

  useEffect(() => {
    if (activeDocument) {
      setTitleValue(activeDocument.title);
    }
  }, [activeDocument]);

  const isDocumentPage = !!documentId && !!activeDocument;

  const handleTitleBlur = () => {
    const trimmedTitle = titleValue.trim();
    if (!trimmedTitle || !activeDocument) return;
    docStore.updateDocument(activeDocument.id, trimmedTitle);
  };

  const handleSave = () => {
    dispatch(spreadsheetActions.triggerSave());
  };

  const getLiveSnapshot = () => {
    const tableState = reduxStore.getState().spreadsheet;
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
    <header className={styles.header}>
      <div className={styles.left}>
        <Button
          variant="ghost"
          className={styles.sidebarToggle}
          onClick={onToggleSidebar}
          aria-label="Переключить боковую панель"
        >
          <MenuIcon size={20} />
        </Button>

        <AppBreadcrumbs
          titleValue={titleValue}
          onTitleChange={(value) => setTitleValue(value)}
          onTitleBlur={handleTitleBlur}
        />
      </div>

      <div className={styles.right}>
        {isDocumentPage && activeDocument && (
          <div className={styles.documentActions}>
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

        {user && (
          <Dropdown
            trigger={
              <button
                type="button"
                className={styles.userWidget}
                aria-label="User profile menu"
              >
                <span className={styles.userName}>{user.name}</span>
                <div className={styles.userAvatar}>
                  <UserIcon size={18} />
                </div>
              </button>
            }
            menuClassName={styles.userDropdown}
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
