import { v4 as uuidv4 } from "uuid";
import { exportToCSV, parseCSV } from "@/lib/csv";
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

  private listListeners = new Set<Listener>();
  private statusListeners = new Set<Listener>();
  private openDocumentListeners = new Set<Listener>();

  constructor() {
    this.loadFromLocalStorage();
  }

  subscribeList(listener: Listener) {
    this.listListeners.add(listener);
    return () => this.listListeners.delete(listener);
  }

  subscribeStatus(listener: Listener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  subscribeOpenDocument(listener: Listener) {
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

  setOpenDocument(id: string | null) {
    if (id === null || id === "") {
      this.openDocumentId = null;
      this.openDocumentListeners.forEach((l) => l());
      return;
    }

    const doc = this.getDocumentById(id);
    if (doc) {
      this.openDocumentId = id;
      this.openDocumentListeners.forEach((l) => l());
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

    this.documents = [...this.documents, newDoc];
    this.saveToLocalStorage();
    this.listListeners.forEach((l) => l());
    return newDoc;
  }

  updateDocument(id: string, newTitle: string) {
    const doc = this.getDocumentById(id);
    if (doc) {
      doc.title = newTitle;
      doc.updatedAt = Date.now();

      const newDocs = [...this.documents.filter((doc) => doc.id !== id), doc];
      this.documents = newDocs;

      this.saveToLocalStorage();
      this.listListeners.forEach((l) => l());
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

    this.documents = [...this.documents, duplicate];
    this.saveToLocalStorage();
    this.listListeners.forEach((l) => l());
  }

  deleteDocument(id: string) {
    this.documents = this.documents.filter((doc) => doc.id !== id);
    this.saveToLocalStorage();
    this.listListeners.forEach((l) => l());
  }

  async autoSave(id: string, state: TableSnapshot) {
    this.setSaveStatus("saving");

    try {
      const doc = this.getDocumentById(id);
      if (!doc) throw new Error("Document not found");

      doc.tableSnapshot = { ...state };
      doc.updatedAt = Date.now();

      this.saveToLocalStorage();

      // TODO: remove
      await new Promise((res) => setTimeout(() => res(null), 500));

      this.setSaveStatus("saved");
    } catch (_) {
      this.setSaveStatus("error");
    }
  }

  private setSaveStatus(status: SaveStatus) {
    this.saveStatus = status;
    this.statusListeners.forEach((l) => l());
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

  exportToCsv(doc: Document): string {
    const { gridSnapshot, gridSize } = doc.tableSnapshot;
    const data: string[][] = [];

    for (let r = 0; r < gridSize.rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < gridSize.cols; c++) {
        const cellId = `${gridSnapshot.rowIds[r]}_${gridSnapshot.colIds[c]}`;
        row.push(gridSnapshot.cells[cellId] || "");
      }
      data.push(row);
    }
    return exportToCSV(data);
  }

  exportToJson(doc: Document): string {
    const payload = {
      id: doc.id,
      title: doc.title,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      tableSnapshot: doc.tableSnapshot,
    };
    return JSON.stringify(payload, null, 2);
  }

  importFromCsv(csv: string, title: string): Document {
    const rows = parseCSV(csv);
    const numRows = Math.max(rows.length, 1);
    const numCols = Math.max(
      rows.reduce((max, r) => Math.max(max, r.length), 0),
      1
    );
    // Cap cols to 26 (A–Z address space)
    const safeCols = Math.min(numCols, 26);

    const tempStore = new TableStore({ rows: numRows, cols: safeCols });
    const snapshot = tempStore.getGridSnapshot();

    rows.forEach((row, r) => {
      row.slice(0, safeCols).forEach((value, c) => {
        if (value !== "") {
          const cellId = `${snapshot.rowIds[r]}_${snapshot.colIds[c]}`;
          snapshot.cells[cellId] = value;
        }
      });
    });

    const newDoc: Document = {
      id: uuidv4(),
      title: title || "Imported document",
      tableSnapshot: {
        gridSnapshot: snapshot,
        gridSize: tempStore.getGridSizeSnapshot(),
        colWidths: tempStore.getColWidthsSnapshot(),
        rowHeights: tempStore.getRowHeightsSnapshot(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.documents = [...this.documents, newDoc];
    this.saveToLocalStorage();
    this.listListeners.forEach((l) => l());
    this.setOpenDocument(newDoc.id);
    return newDoc;
  }
}
