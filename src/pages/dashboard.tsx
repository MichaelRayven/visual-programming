import {
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  FileTextIcon,
  SearchIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";
import { CardActionsDropdown } from "@/components/card-actions-dropdown";
import { CreateDocumentDialog } from "@/components/create-document-dialog";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";
import { MenuContent, MenuItem } from "@/components/menu";
import { RenameDocumentDialog } from "@/components/rename-document-dialog";
import { useDocumentList, useDocumentStore } from "@/hooks/useDocumentStore";
import {
  exportDocToCsv,
  exportDocToJson,
  importDocFromCsv,
} from "@/lib/document";
import { evaluateCell } from "@/lib/formula";
import { getCellAddress } from "@/lib/table";
import { formatDate } from "@/lib/utils";
import { type Document } from "@/store/documentSlice";
import type { TableSnapshot } from "@/store/tableSlice";
import "./dashboard.css";

type SortOption = "name" | "dateCreated" | "dateModified";

export function DashboardPage() {
  const documents = useDocumentList();
  const store = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("dateModified");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameDoc, setRenameDoc] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = documents.filter((doc) =>
        doc.title.toLowerCase().includes(query)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "dateCreated":
          return b.createdAt - a.createdAt;
        case "dateModified":
          return b.updatedAt - a.updatedAt;
        default:
          return 0;
      }
    });

    return sorted;
  }, [documents, searchQuery, sortBy]);

  const handleExportCsv = (doc: Document) => {
    const csv = exportDocToCsv(doc);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.title}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = (doc: Document) => {
    const json = exportDocToJson(doc);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.title}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name.replace(/\.csv$/i, "");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") {
        const newDoc = importDocFromCsv(text, fileName);
        store.importDocument(newDoc);
      }
    };
    reader.readAsText(file, "utf-8");
    // Reset so the same file can be re-imported
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const handleOpenDocument = (id: string) => {
    store.setOpenDocument(id);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="text-xl font-semibold">Мои документы</h1>
        </div>

        <div className="dashboard-header-center">
          <div className="dashboard-search-wrapper">
            <div className="dashboard-search-icon">
              <SearchIcon size={16} />
            </div>
            <input
              type="text"
              className="dashboard-search-input"
              placeholder="Поиск документов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="dashboard-header-right">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv"
            className="dashboard-import-input"
            aria-label="Import CSV file"
            onChange={handleImportCsv}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => importInputRef.current?.click()}
            title="Import CSV"
          >
            <UploadIcon size={16} />
            Импорт CSV
          </Button>
          <CreateDocumentDialog />
          <div className="dashboard-avatar">
            <UserIcon size={20} />
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <div className="dashboard-sort-group">
            <label className="dashboard-sort-label">Сортировка:</label>
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>

        {filteredAndSortedDocuments.length === 0 ? (
          <div className="dashboard-empty-state">
            <FileTextIcon size={64} className="dashboard-empty-state-icon" />
            <h2 className="dashboard-empty-state-title">
              {searchQuery ? "Документы не найдены" : "Нет документов"}
            </h2>
            <p className="dashboard-empty-state-description">
              {searchQuery
                ? "Попробуйте изменить поисковый запрос"
                : "Создайте свой первый документ, чтобы начать работу"}
            </p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {filteredAndSortedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="document-card"
                onClick={() => handleOpenDocument(doc.id)}
              >
                <div className="document-card-header">
                  <DocumentTitle
                    title={doc.title}
                    onTitleChange={(t) => store.updateDocument(doc.id, t)}
                  />
                  <CardActionsDropdown
                    onRename={() =>
                      setRenameDoc({ id: doc.id, title: doc.title })
                    }
                    onDuplicate={() => store.duplicateDocument(doc.id)}
                    onExportCsv={() => handleExportCsv(doc)}
                    onExportJson={() => handleExportJson(doc)}
                    onDelete={() => setDeleteId(doc.id)}
                  />
                </div>

                <TablePreview snapshot={doc.tableSnapshot} />

                <div className="document-card-metadata">
                  <div className="document-card-metadata-row">
                    <CalendarIcon size={12} />
                    <span>Создан: {formatDate(doc.createdAt)}</span>
                  </div>
                  <div className="document-card-metadata-row">
                    <ClockIcon size={12} />
                    <span>Изменён: {formatDate(doc.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
          title="Удаление документа"
          content="Вы уверены? Это действие нельзя отменить."
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  store.deleteDocument(deleteId!);
                  setDeleteId(null);
                }}
              >
                Удалить
              </Button>
            </>
          }
        />

        <RenameDocumentDialog
          open={!!renameDoc}
          onOpenChange={(open) => !open && setRenameDoc(null)}
          currentTitle={renameDoc?.title || ""}
          onRename={(newTitle) => {
            if (renameDoc) {
              store.updateDocument(renameDoc.id, newTitle);
            }
          }}
        />
      </main>
    </div>
  );
}

function DocumentTitle({
  title = "",
  onTitleChange,
}: {
  title?: string;
  onTitleChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(title);

  // Update local state when prop changes
  useEffect(() => {
    setValue(title);
  }, [title]);

  return (
    <Input
      className="document-card-title"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value !== "") {
          onTitleChange?.(value);
        } else {
          setValue(title);
        }
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

function TablePreview({ snapshot }: { snapshot: TableSnapshot }) {
  const { rows, cols } = snapshot.gridSize;
  const previewRows = Math.min(rows, 3);
  const previewCols = Math.min(cols, 3);

  return (
    <div
      className="document-preview-grid"
      style={{ gridTemplateColumns: `repeat(${previewCols}, 1fr)` }}
    >
      {Array.from({ length: previewRows }).map((_, r) =>
        Array.from({ length: previewCols }).map((_, c) => {
          const cellAddress = getCellAddress(r, c);
          const cellData = evaluateCell(cellAddress, snapshot.gridSnapshot);
          const displayValue =
            typeof cellData.value === "boolean"
              ? cellData.value.toString()
              : cellData.value;

          return (
            <div key={`${r}-${c}`} className="document-preview-cell">
              {displayValue}
            </div>
          );
        })
      )}
    </div>
  );
}

function SortDropdown({
  sortBy,
  onSortChange,
}: {
  sortBy: SortOption;
  onSortChange: (val: SortOption) => void;
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

  const action = (val: SortOption) => {
    onSortChange(val);
    setOpen(false);
  };

  const getLabel = (val: SortOption) => {
    switch (val) {
      case "dateModified":
        return "По дате изменения";
      case "dateCreated":
        return "По дате создания";
      case "name":
        return "По названию";
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {getLabel(sortBy)}
        <ChevronDownIcon size={14} />
      </Button>
      {open && (
        <MenuContent className="menu-dropdown">
          <MenuItem onClick={() => action("dateModified")}>
            По дате изменения
          </MenuItem>
          <MenuItem onClick={() => action("dateCreated")}>
            По дате создания
          </MenuItem>
          <MenuItem onClick={() => action("name")}>По названию</MenuItem>
        </MenuContent>
      )}
    </div>
  );
}
