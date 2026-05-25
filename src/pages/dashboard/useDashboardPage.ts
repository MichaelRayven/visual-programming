import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { type Document } from "@/store/documentsSlice";
import { type SortOption } from "./components/SortDropdown";

export function useDashboardPage() {
  const navigate = useNavigate();
  const documents = useDocumentList();
  const docStore = useDocumentStore();
  const { renameOpen, deleteOpen } = useUIModals();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("dateModified");
  const importInputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only fetch documents once on mount
  useEffect(() => {
    docStore.fetchDocuments();
  }, []);

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = documents.filter((doc) =>
        doc.title.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
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
  }, [documents, searchQuery, sortBy]);

  const handleExportCsv = (doc: Document) => {
    const csv = exportDocToCsv(doc);
    downloadDocumentFile(csv, `${doc.title}.csv`, "text/csv");
  };

  const handleExportJson = (doc: Document) => {
    const json = exportDocToJson(doc);
    downloadDocumentFile(json, `${doc.title}.json`, "application/json");
  };

  const handleImportCsv = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name.replace(/\.csv$/i, "");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") {
        const newDoc = importDocFromCsv(text, fileName);
        docStore.importDocument(newDoc);
        navigate(`/documents/${newDoc.id}`);
      }
    };
    reader.readAsText(file, "utf-8");
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const handleOpenDocument = (id: string) => {
    navigate(`/documents/${id}`);
  };

  return {
    filteredAndSortedDocuments,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    renameOpen,
    deleteOpen,
    importInputRef,
    docStore,
    handleExportCsv,
    handleExportJson,
    handleImportCsv,
    handleOpenDocument,
  };
}
