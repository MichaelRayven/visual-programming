import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  LoaderIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Table } from "@/components/table";
import {
  useDocumentSaveStatus,
  useDocumentStore,
} from "@/hooks/useDocumentStore";
import { debounce } from "@/lib/utils";
import { type Document } from "@/stores/document";
import { type TableSnapshot, TableStore } from "@/stores/table";
import "./document.css";

export function DocumentPage({ document }: { document: Document }) {
  const documentStore = useDocumentStore();
  const saveStatus = useDocumentSaveStatus();

  const storeRef = useRef<TableStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = new TableStore(document.tableSnapshot.gridSize);
    storeRef.current.loadSavedTable(document.tableSnapshot);
  }

  const debouncedSave = useMemo(
    () =>
      debounce((snapshot: TableSnapshot) => {
        documentStore.autoSave(document.id, snapshot);
      }, 500),
    [document, documentStore]
  );

  useEffect(() => {
    const tableStore = storeRef.current;
    if (!tableStore) return;

    const unsubscribe = tableStore.subscribe(() => {
      debouncedSave({
        colWidths: tableStore.getColWidthsSnapshot(),
        rowHeights: tableStore.getRowHeightsSnapshot(),
        gridSize: tableStore.getGridSizeSnapshot(),
        gridSnapshot: tableStore.getGridSnapshot(),
      });
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        documentStore.autoSave(document.id, {
          colWidths: tableStore.getColWidthsSnapshot(),
          rowHeights: tableStore.getRowHeightsSnapshot(),
          gridSize: tableStore.getGridSizeSnapshot(),
          gridSnapshot: tableStore.getGridSnapshot(),
        });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (documentStore.getSaveStatus() === "saving") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [document, debouncedSave, documentStore]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    documentStore.updateDocument(document.id, newTitle);
  };

  const handleBackToDashboard = () => {
    documentStore.setOpenDocument(null);
  };

  if (!document) {
    return <div className="p-4">Загрузка документа...</div>;
  }

  return (
    <div className="document-page">
      <header className="document-header">
        <div className="document-header-left">
          <button
            className="document-back-button"
            onClick={handleBackToDashboard}
            aria-label="Вернуться к списку документов"
          >
            <ArrowLeftIcon size={20} />
          </button>

          <input
            type="text"
            className="document-title-input"
            value={document.title}
            onChange={handleTitleChange}
            placeholder="Без названия"
          />
        </div>

        <div className="document-header-right">
          <SaveStatusBadge status={saveStatus} />
        </div>
      </header>

      <main className="document-main">
        <Table
          snapshot={document.tableSnapshot}
          store={storeRef.current ?? undefined}
        />
      </main>
    </div>
  );
}

function SaveStatusBadge({ status }: { status: "saved" | "saving" | "error" }) {
  if (status === "saved") {
    return (
      <div className="document-save-status document-save-status-saved">
        <span className="document-save-status-icon">
          <CheckCircleIcon size={16} />
        </span>
        <span>Сохранено</span>
      </div>
    );
  }

  if (status === "saving") {
    return (
      <div className="document-save-status document-save-status-saving">
        <span className="document-save-status-icon">
          <LoaderIcon size={16} className="animate-spin" />
        </span>
        <span>Сохранение...</span>
      </div>
    );
  }

  return (
    <div className="document-save-status document-save-status-error">
      <span className="document-save-status-icon">
        <AlertCircleIcon size={16} />
      </span>
      <span>Ошибка сохранения</span>
    </div>
  );
}
