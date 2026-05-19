import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DownloadIcon,
  FileJsonIcon,
  LoaderIcon,
  SaveIcon,
} from "lucide-react";
import {
  type ChangeEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/button";
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

  const [titleValue, setTitleValue] = useState(document.title);

  useEffect(() => {
    setTitleValue(document.title);
  }, [document]);

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

  const handleSave = () => {
    const tableStore = storeRef.current;
    if (!tableStore) return;
    documentStore.autoSave(document.id, {
      colWidths: tableStore.getColWidthsSnapshot(),
      rowHeights: tableStore.getRowHeightsSnapshot(),
      gridSize: tableStore.getGridSizeSnapshot(),
      gridSnapshot: tableStore.getGridSnapshot(),
    });
  };

  const handleExportCsv = () => {
    const csv = documentStore.exportToCsv(document);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${document.title}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const json = documentStore.exportToJson(document);
    const blob = new Blob([json], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${document.title}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTitleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTitleValue(e.target.value);
  };

  const handleTitleBlur = () => {
    const trimmedTitle = titleValue.trim();
    if (!trimmedTitle) return;
    documentStore.updateDocument(document.id, trimmedTitle);
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
            value={titleValue}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            placeholder="Без названия"
          />

          <SaveStatusBadge status={saveStatus} />
        </div>

        <div className="document-header-right">
          <ExportMenu
            onExportCsv={handleExportCsv}
            onExportJson={handleExportJson}
          />
          <Button variant="primary" size="sm" onClick={handleSave}>
            <SaveIcon size={16} />
            Save
          </Button>
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
    <div ref={ref} className="document-export-menu">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Export options"
      >
        <DownloadIcon size={16} />
        Export
        <ChevronDownIcon size={14} />
      </Button>
      {open && (
        <div className="document-export-dropdown" role="menu">
          <button
            type="button"
            className="document-export-item"
            role="menuitem"
            onClick={() => action(onExportCsv)}
          >
            <DownloadIcon size={14} />
            Export CSV
          </button>
          <button
            type="button"
            className="document-export-item"
            role="menuitem"
            onClick={() => action(onExportJson)}
          >
            <FileJsonIcon size={14} />
            Export JSON
          </button>
        </div>
      )}
    </div>
  );
}
