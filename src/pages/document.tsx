import { useEffect, useMemo, useRef } from "react";
import { Table } from "@/components/table";
import {
  useDocument,
  useDocumentSaveStatus,
  useDocumentStore,
} from "@/hooks/useDocumentStore";
import { debounce } from "@/lib/utils";
import { type TableSnapshot, TableStore } from "@/stores/table";

export function DocumentPage({ id }: { id: string }) {
  const documentStore = useDocumentStore();
  const saveStatus = useDocumentSaveStatus();
  const document = useDocument(id);

  const storeRef = useRef<TableStore | null>(null);

  const debouncedSave = useMemo(
    () =>
      debounce((snapshot: TableSnapshot) => {
        documentStore.autoSave(id, snapshot);
      }, 500),
    [id, documentStore]
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
        documentStore.autoSave(id, {
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
  }, [id, debouncedSave, documentStore]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    documentStore.updateDocument(id, newTitle);
  };

  if (!document) {
    return <div className="p-4">Загрузка документа...</div>;
  }

  return (
    <div>
      <header>
        <div>
          <input
            type="text"
            value={document.title}
            onChange={handleTitleChange}
            placeholder="Без названия"
          />

          <span>
            {documentStore.getSaveStatus() === "saving" && "Сохранение..."}
            {saveStatus === "saved" && "Сохранено на диске"}
            {saveStatus === "error" && "Ошибка сохранения"}
          </span>
        </div>
      </header>

      <main>
        <Table
          snapshot={document.tableSnapshot}
          store={storeRef.current ?? undefined}
        />
      </main>
    </div>
  );
}
