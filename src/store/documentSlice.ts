import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { type TableSnapshot } from "./tableSlice";

export type SaveStatus = "saved" | "saving" | "error";

export type Document = {
  id: string;
  title: string;
  tableSnapshot: TableSnapshot;
  createdAt: number;
  updatedAt: number;
};

export type DocumentState = {
  documents: Document[];
  openDocumentId: string | null;
  saveStatus: SaveStatus;
};

const getInitialDocuments = (): Document[] => {
  try {
    const data = localStorage.getItem("spreadsheet_docs");
    if (data) {
      return JSON.parse(data);
    }
  } catch (_e) {
    // Ignore error
  }
  return [];
};

const initialState: DocumentState = {
  documents: getInitialDocuments(),
  openDocumentId: null,
  saveStatus: "saved",
};

export const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    createDocument: (
      state,
      action: PayloadAction<{ title: string; rows: number; cols: number }>
    ) => {
      const { title, rows, cols } = action.payload;

      const newDoc: Document = {
        id: uuidv4(),
        title: title || "Без названия",
        tableSnapshot: {
          gridSnapshot: {
            cells: {},
            rowIds: Array.from({ length: rows }, () => uuidv4()),
            colIds: Array.from({ length: cols }, () => uuidv4()),
          },
          gridSize: { rows, cols },
          colWidths: {},
          rowHeights: {},
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      state.documents.push(newDoc);
    },
    updateDocument: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      const { id, title } = action.payload;
      const doc = state.documents.find((d) => d.id === id);
      if (doc) {
        doc.title = title;
        doc.updatedAt = Date.now();
      }
    },
    duplicateDocument: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const source = state.documents.find((d) => d.id === id);
      if (source) {
        const duplicate: Document = {
          ...JSON.parse(JSON.stringify(source)),
          id: uuidv4(),
          title: `${source.title} (Копия)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        state.documents.push(duplicate);
      }
    },
    deleteDocument: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.documents = state.documents.filter((d) => d.id !== id);
      if (state.openDocumentId === id) {
        state.openDocumentId = null;
      }
    },
    setOpenDocument: (state, action: PayloadAction<string | null>) => {
      state.openDocumentId = action.payload;
    },
    setSaveStatus: (state, action: PayloadAction<SaveStatus>) => {
      state.saveStatus = action.payload;
    },
    updateTableSnapshot: (
      state,
      action: PayloadAction<{ id: string; snapshot: TableSnapshot }>
    ) => {
      const { id, snapshot } = action.payload;
      const doc = state.documents.find((d) => d.id === id);
      if (doc) {
        doc.tableSnapshot = snapshot;
        doc.updatedAt = Date.now();
      }
    },
    importDocument: (state, action: PayloadAction<Document>) => {
      state.documents.push(action.payload);
      state.openDocumentId = action.payload.id;
    },
  },
});

export const documentActions = documentSlice.actions;
export default documentSlice.reducer;
