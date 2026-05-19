import { CopyIcon, DownloadIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/button";
import { CreateDocumentDialog } from "@/components/create-document-dialog";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";
import { useDocumentList, useDocumentStore } from "@/hooks/useDocumentStore";
import { type Document } from "@/stores/document";
import type { TableSnapshot } from "@/stores/table";
import styles from "./dashboard.module.css";

export function DashboardPage() {
  const documents = useDocumentList();
  const store = useDocumentStore();

  const handleExport = (doc: Document) => {
    const csv = store.exportToCsv(doc);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.title}.csv`;
    link.click();
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Мои документы</h1>
        <CreateDocumentDialog />
      </header>
      <main className={styles.dashboardGrid}>
        {documents.map((doc) => (
          <div key={doc.id} className={styles.documentCard}>
            <div className={styles.headerRow}>
              <DocumentTitle
                title={doc.title}
                onTitleChange={(t) => store.updateDocument(doc.id, t)}
              />
              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => store.duplicateDocument(doc.id)}
                >
                  <CopyIcon size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(doc.id)}
                >
                  <Trash2Icon size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExport(doc)}
                >
                  <DownloadIcon size={16} />
                </Button>
              </div>
            </div>

            <TablePreview snapshot={doc.tableSnapshot} />
          </div>
        ))}

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

  return (
    <Input
      className={styles.documentCardTitle}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value !== "") {
          onTitleChange?.(value);
        } else {
          setValue(title);
        }
      }}
    />
  );
}

export function TablePreview({ snapshot }: { snapshot: TableSnapshot }) {
  const { rows, cols } = snapshot.gridSize;
  const previewRows = Math.min(rows, 4);
  const previewCols = Math.min(cols, 4);

  return (
    <div
      className={styles.previewGrid}
      style={{ gridTemplateColumns: `repeat(${previewCols}, 1fr)` }}
    >
      {Array.from({ length: previewRows }).map((_, r) =>
        Array.from({ length: previewCols }).map((_, c) => (
          <div key={`${r}-${c}`} className={styles.previewCell} />
        ))
      )}
    </div>
  );
}
