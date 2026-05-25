import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import { type TableSnapshot } from "./spreadsheetSlice";

export type Document = {
  id: string;
  title: string;
  userId: string;
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

const fetchDocuments = createAsyncThunk(
  "documents/fetchDocuments",
  async (_, thunkAPI) => {
    try {
      const docs = await api.getDocuments();
      return docs;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(
        err.message || "Failed to load documents"
      );
    }
  }
);

const fetchDocumentById = createAsyncThunk(
  "documents/fetchDocumentById",
  async (id: string, thunkAPI) => {
    try {
      const doc = await api.getDocumentById(id);
      return doc;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(err.message || "Failed to load document");
    }
  }
);

export const saveDocument = createAsyncThunk(
  "documents/saveDocument",
  async (
    { id, snapshot }: { id: string; snapshot: TableSnapshot },
    thunkAPI
  ) => {
    try {
      const savedDoc = await api.saveDocument(id, snapshot);
      return savedDoc;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(err.message || "Failed to save document");
    }
  }
);

const createDoc = createAsyncThunk(
  "documents/createDoc",
  async (
    { title, rows, cols }: { title: string; rows: number; cols: number },
    thunkAPI
  ) => {
    try {
      const newDoc = await api.createDocument(title, rows, cols);
      return newDoc;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(
        err.message || "Failed to create document"
      );
    }
  }
);

const updateDoc = createAsyncThunk(
  "documents/updateDoc",
  async ({ id, title }: { id: string; title: string }, thunkAPI) => {
    try {
      const updatedDoc = await api.updateDocument(id, title);
      return updatedDoc;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(
        err.message || "Failed to update document"
      );
    }
  }
);

const duplicateDoc = createAsyncThunk(
  "documents/duplicateDoc",
  async (id: string, thunkAPI) => {
    try {
      const duplicate = await api.duplicateDocument(id);
      return duplicate;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(
        err.message || "Failed to duplicate document"
      );
    }
  }
);

const deleteDoc = createAsyncThunk(
  "documents/deleteDoc",
  async (id: string, thunkAPI) => {
    try {
      const deletedId = await api.deleteDocument(id);
      return deletedId;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(
        err.message || "Failed to delete document"
      );
    }
  }
);

const importDoc = createAsyncThunk(
  "documents/importDoc",
  async (doc: Omit<Document, "userId">, thunkAPI) => {
    try {
      await api.ensureValidToken();
      const activeUserId = api.getActiveUserId();
      if (!activeUserId) throw new Error("401");

      const data = localStorage.getItem("spreadsheet_docs");
      const docs = data ? JSON.parse(data) : [];

      const importedDoc: Document = {
        ...doc,
        userId: activeUserId, // Strict ownership mapping
        updatedAt: Date.now(),
      };

      docs.push(importedDoc);
      localStorage.setItem("spreadsheet_docs", JSON.stringify(docs));
      return importedDoc;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(
        err.message || "Failed to import document"
      );
    }
  }
);

export const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setActiveDocumentId: (state, action: PayloadAction<string | null>) => {
      state.activeDocumentId = action.payload;
    },
    clearDocuments: (state) => {
      state.documents = [];
      state.activeDocumentId = null;
      state.loadingStatus = "idle";
      state.error = null;
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
        state.error = action.payload as string;
      })
      .addCase(fetchDocumentById.pending, (state) => {
        state.loadingStatus = "loading";
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.activeDocumentId = action.payload.id;
        const exists = state.documents.some((d) => d.id === action.payload.id);
        if (!exists) {
          state.documents.push(action.payload);
        }
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.error = action.payload as string; // Will store "403" or "404" for page check
      })
      .addCase(saveDocument.fulfilled, (state, action) => {
        const { id, tableSnapshot } = action.payload;
        const doc = state.documents.find((d) => d.id === id);
        if (doc) {
          doc.tableSnapshot = tableSnapshot;
          doc.updatedAt = Date.now();
        }
      })
      .addCase(createDoc.fulfilled, (state, action) => {
        state.documents.push(action.payload);
        state.activeDocumentId = action.payload.id;
      })
      .addCase(updateDoc.fulfilled, (state, action) => {
        const { id, title } = action.payload;
        const doc = state.documents.find((d) => d.id === id);
        if (doc) {
          doc.title = title;
          doc.updatedAt = Date.now();
        }
      })
      .addCase(duplicateDoc.fulfilled, (state, action) => {
        state.documents.push(action.payload);
      })
      .addCase(deleteDoc.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.documents = state.documents.filter((d) => d.id !== deletedId);
        if (state.activeDocumentId === deletedId) {
          state.activeDocumentId = null;
        }
      })
      .addCase(importDoc.fulfilled, (state, action) => {
        state.documents.push(action.payload);
        state.activeDocumentId = action.payload.id;
      });
  },
});

export const documentsActions = {
  ...documentsSlice.actions,
  createDocument: createDoc,
  updateDocument: updateDoc,
  duplicateDocument: duplicateDoc,
  deleteDocument: deleteDoc,
  importDocument: importDoc,
  fetchDocuments: fetchDocuments,
  fetchDocumentById: fetchDocumentById,
  saveDocument: saveDocument,
};

export default documentsSlice.reducer;
