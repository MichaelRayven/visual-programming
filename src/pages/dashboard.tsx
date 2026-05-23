import {
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  SearchIcon,
  UploadIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/button";
import { CardActionsDropdown } from "@/components/card-actions-dropdown";
import { CreateDocumentDialog } from "@/components/create-document-dialog";
import { DocumentCardTitle } from "@/components/dashboard/document-card-title";
import {
  SortDropdown,
  type SortOption,
} from "@/components/dashboard/sort-dropdown";
import { TablePreview } from "@/components/dashboard/table-preview";
import { Dialog } from "@/components/dialog";
import { RenameDocumentDialog } from "@/components/rename-document-dialog";
import {
  useDocumentList,
  useDocumentStore,
  useUIModals,
} from "@/hooks/useDocumentStore";
import {
  downloadDocumentFile,
  exportDocToCsv,
  exportDocToJson,
  importDocFromCsv,
} from "@/lib/document";
import { formatDate } from "@/lib/utils";
import { type Document } from "@/store/documentsSlice";
import "./dashboard.css";

export function DashboardPage() {
  const navigate = useNavigate();
  const documents = useDocumentList();
  const store = useDocumentStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only fetch documents once on mount
  useEffect(() => {
    store.fetchDocuments();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("dateModified");
  const { renameOpen, deleteOpen } = useUIModals();
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
    downloadDocumentFile(csv, `${doc.title}.csv`, "text/csv");
  };

  const handleExportJson = (doc: Document) => {
    const json = exportDocToJson(doc);
    downloadDocumentFile(json, `${doc.title}.json`, "application/json");
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
        navigate(`/documents/${newDoc.id}`);
      }
    };
    reader.readAsText(file, "utf-8");
    // Reset so the same file can be re-imported
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const handleOpenDocument = (id: string) => {
    navigate(`/documents/${id}`);
  };

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <div className="dashboard-controls">
          {/* Left search */}
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

          <div className="dashboard-sort-group">
            <label className="dashboard-sort-label">Сортировка:</label>
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          {/* Right controls */}
          <div className="dashboard-controls-right">
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
                  <DocumentCardTitle
                    title={doc.title}
                    onTitleChange={(t) => store.updateDocument(doc.id, t)}
                  />
                  <CardActionsDropdown
                    onRename={() =>
                      store.setRenameModal({ id: doc.id, title: doc.title })
                    }
                    onDuplicate={() => store.duplicateDocument(doc.id)}
                    onExportCsv={() => handleExportCsv(doc)}
                    onExportJson={() => handleExportJson(doc)}
                    onDelete={() => store.setDeleteModal(doc.id)}
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
          open={!!deleteOpen}
          onOpenChange={() => store.setDeleteModal(null)}
          title="Удаление документа"
          content="Вы уверены? Это действие нельзя отменить."
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => store.setDeleteModal(null)}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  store.deleteDocument(deleteOpen!);
                  store.setDeleteModal(null);
                }}
              >
                Удалить
              </Button>
            </>
          }
        />

        <RenameDocumentDialog
          open={!!renameOpen}
          onOpenChange={(open) => !open && store.setRenameModal(null)}
          currentTitle={renameOpen?.title || ""}
          onRename={(newTitle) => {
            if (renameOpen) {
              store.updateDocument(renameOpen.id, newTitle);
            }
          }}
        />
      </main>
    </div>
  );
}
