import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { type TableSnapshot } from "./spreadsheetSlice";

export type Document = {
  id: string;
  title: string;
  tableSnapshot: TableSnapshot;
  createdAt: number;
  updatedAt: number;
};

export type DocumentsState = {
  documents: Document[];
  activeDocumentId: string | null;
  loadingStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: DocumentsState = {
  documents: [],
  activeDocumentId: null,
  loadingStatus: "idle",
  error: null,
};

// Async Thunks
export const fetchDocuments = createAsyncThunk(
  "documents/fetchDocuments",
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const data = localStorage.getItem("spreadsheet_docs");
    return data ? JSON.parse(data) : [];
  }
);

export const fetchDocumentById = createAsyncThunk(
  "documents/fetchDocumentById",
  async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const data = localStorage.getItem("spreadsheet_docs");
    const docs: Document[] = data ? JSON.parse(data) : [];
    const doc = docs.find((d) => d.id === id);
    if (!doc) {
      throw new Error("Document not found");
    }
    return doc;
  }
);

export const saveDocument = createAsyncThunk(
  "documents/saveDocument",
  async (
    { id, snapshot }: { id: string; snapshot: TableSnapshot },
    thunkAPI
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const state = thunkAPI.getState() as { documents: DocumentsState };
    const documents = state.documents.documents;
    const updatedDocs = documents.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          tableSnapshot: snapshot,
          updatedAt: Date.now(),
        };
      }
      return d;
    });

    localStorage.setItem("spreadsheet_docs", JSON.stringify(updatedDocs));
    return { id, snapshot };
  }
);

export const documentsSlice = createSlice({
  name: "documents",
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
      localStorage.setItem("spreadsheet_docs", JSON.stringify(state.documents));
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
        localStorage.setItem(
          "spreadsheet_docs",
          JSON.stringify(state.documents)
        );
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
        localStorage.setItem(
          "spreadsheet_docs",
          JSON.stringify(state.documents)
        );
      }
    },
    deleteDocument: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.documents = state.documents.filter((d) => d.id !== id);
      if (state.activeDocumentId === id) {
        state.activeDocumentId = null;
      }
      localStorage.setItem("spreadsheet_docs", JSON.stringify(state.documents));
    },
    setActiveDocumentId: (state, action: PayloadAction<string | null>) => {
      state.activeDocumentId = action.payload;
    },
    importDocument: (state, action: PayloadAction<Document>) => {
      state.documents.push(action.payload);
      state.activeDocumentId = action.payload.id;
      localStorage.setItem("spreadsheet_docs", JSON.stringify(state.documents));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loadingStatus = "loading";
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.error = action.error.message || "Failed to load documents";
      })
      .addCase(fetchDocumentById.pending, (state) => {
        state.loadingStatus = "loading";
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.activeDocumentId = action.payload.id;
        // Update local copy if it's different or just ensure it exists in the list
        const exists = state.documents.some((d) => d.id === action.payload.id);
        if (!exists) {
          state.documents.push(action.payload);
        }
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.error = action.error.message || "Failed to load document";
      })
      .addCase(saveDocument.fulfilled, (state, action) => {
        const { id, snapshot } = action.payload;
        const doc = state.documents.find((d) => d.id === id);
        if (doc) {
          doc.tableSnapshot = snapshot;
          doc.updatedAt = Date.now();
        }
      });
  },
});

export const documentsActions = documentsSlice.actions;
export default documentsSlice.reducer;
