import { v4 as uuidv4 } from "uuid";
import { type TableSnapshot, TableStore } from "@/stores/table";

export type Listener = () => void;

export type SaveStatus = "saved" | "saving" | "error";

export type Document = {
  id: string;
  title: string;
  tableSnapshot: TableSnapshot;
  createdAt: number;
  updatedAt: number;
};

export class DocumentStore {
  private documents: Document[] = [];
  private openDocumentId: string | null = null;
  private saveStatus: SaveStatus = "saved";

  private listListeners = new Set<() => void>();
  private statusListeners = new Set<(status: SaveStatus) => void>();
  private openDocumentListeners = new Set<(id: string) => void>();

  constructor() {
    this.loadFromLocalStorage();
  }

  subscribeList(listener: () => void) {
    this.listListeners.add(listener);
    return () => this.listListeners.delete(listener);
  }

  subscribeStatus(listener: (status: SaveStatus) => void) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  subscribeOpenDocument(listener: (id: string) => void) {
    this.openDocumentListeners.add(listener);
    return () => this.openDocumentListeners.delete(listener);
  }

  getDocuments() {
    return this.documents;
  }

  getDocumentById(id: string) {
    return this.documents.find((doc) => doc.id === id);
  }

  getOpenDocument() {
    return this.openDocumentId
      ? this.documents.find((doc) => doc.id === this.openDocumentId)
      : null;
  }

  getSaveStatus() {
    return this.saveStatus;
  }

  setOpenDocument(id: string) {
    const doc = this.getDocumentById(id);
    if (doc) {
      this.openDocumentId = id;
      this.openDocumentListeners.forEach((l) => l(id));
    }
  }

  createDocument(title: string, rows: number, cols: number) {
    const tempStore = new TableStore({ rows, cols });
    const newDoc: Document = {
      id: uuidv4(),
      title: title || "Без названия",
      tableSnapshot: {
        gridSnapshot: tempStore.getGridSnapshot(),
        gridSize: tempStore.getGridSizeSnapshot(),
        colWidths: tempStore.getColWidthsSnapshot(),
        rowHeights: tempStore.getRowHeightsSnapshot(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.documents.push(newDoc);
    this.saveToLocalStorage();
    this.notifyList();
    return newDoc;
  }

  updateDocument(id: string, newTitle: string) {
    const doc = this.getDocumentById(id);
    if (doc) {
      doc.title = newTitle;
      doc.updatedAt = Date.now();
      this.saveToLocalStorage();
      this.notifyList();
    }
  }

  duplicateDocument(id: string) {
    const source = this.getDocumentById(id);
    if (!source) return;

    const duplicate: Document = {
      ...JSON.parse(JSON.stringify(source)),
      id: uuidv4(),
      title: `${source.title} (Копия)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.documents.push(duplicate);
    this.saveToLocalStorage();
    this.notifyList();
  }

  deleteDocument(id: string) {
    this.documents = this.documents.filter((doc) => doc.id !== id);
    this.saveToLocalStorage();
    this.notifyList();
  }

  async autoSave(id: string, state: TableSnapshot) {
    this.setSaveStatus("saving");

    try {
      const doc = this.getDocumentById(id);
      if (!doc) throw new Error("Document not found");

      doc.tableSnapshot = { ...state };
      doc.updatedAt = Date.now();

      this.saveToLocalStorage();

      this.setSaveStatus("saved");
    } catch (_) {
      this.setSaveStatus("error");
    }
  }

  private setSaveStatus(status: SaveStatus) {
    this.saveStatus = status;
    this.statusListeners.forEach((l) => l(status));
  }

  private notifyList() {
    this.listListeners.forEach((l) => l());
  }

  private saveToLocalStorage() {
    localStorage.setItem("spreadsheet_docs", JSON.stringify(this.documents));
  }

  private loadFromLocalStorage() {
    const data = localStorage.getItem("spreadsheet_docs");
    if (data) {
      const parsed = JSON.parse(data);
      this.documents = parsed;
    }
  }
}
