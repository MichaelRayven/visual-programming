import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it } from "vitest";
import { api } from "@/lib/api";
import documentsReducer, {
  createDoc,
  type Document,
  type DocumentsState,
  deleteDoc,
  documentsActions,
  duplicateDoc,
  fetchDocumentById,
  fetchDocuments,
  importDoc,
  saveDocument,
  updateDoc,
} from "./documentsSlice";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("documentsSlice reducer", () => {
  beforeEach(async () => {
    localStorage.clear();
    // Seed and authenticate simulated user to prevent 401s in thunk tests
    await api.login("michael@example.com", "password123");
  });

  const getInitialState = (): DocumentsState => ({
    documents: [],
    activeDocumentId: null,
    error: null,
  });

  it("should return the initial state", () => {
    expect(documentsReducer(undefined, { type: "" })).toEqual(
      getInitialState()
    );
  });

  it("should handle createDoc.fulfilled", () => {
    const initialState = getInitialState();
    const newDoc: Document = {
      id: "doc-123",
      title: "New Doc",
      userId: "user-michael",
      tableSnapshot: {
        gridSnapshot: { cells: {}, rowIds: [], colIds: [] },
        colWidths: {},
        rowHeights: {},
        gridSize: { rows: 10, cols: 5 },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextState = documentsReducer(
      initialState,
      createDoc.fulfilled(newDoc, "req-1", {
        title: "New Doc",
        rows: 10,
        cols: 5,
      })
    );

    expect(nextState.documents.length).toBe(1);
    expect(nextState.documents[0].title).toBe("New Doc");
    expect(nextState.documents[0].userId).toBe("user-michael");
    expect(nextState.documents[0].tableSnapshot.gridSize).toEqual({
      rows: 10,
      cols: 5,
    });
  });

  it("should handle updateDoc.fulfilled", () => {
    const doc: Document = {
      id: "doc-1",
      title: "Old Title",
      userId: "user-michael",
      tableSnapshot: {
        gridSnapshot: { cells: {}, rowIds: [], colIds: [] },
        colWidths: {},
        rowHeights: {},
        gridSize: { rows: 2, cols: 2 },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const initialState = {
      ...getInitialState(),
      documents: [doc],
    };

    const nextState = documentsReducer(
      initialState,
      updateDoc.fulfilled(
        {
          id: "doc-1",
          title: "New Title",
          userId: "user-michael",
          createdAt: 0,
          updatedAt: 0,
          tableSnapshot: doc.tableSnapshot,
        },
        "req-2",
        { id: "doc-1", title: "New Title" }
      )
    );

    expect(nextState.documents[0].title).toBe("New Title");
  });

  it("should handle duplicateDoc.fulfilled", () => {
    const doc: Document = {
      id: "doc-1",
      title: "Source Doc",
      userId: "user-michael",
      tableSnapshot: {
        gridSnapshot: { cells: { r_c: "hello" }, rowIds: [], colIds: [] },
        colWidths: {},
        rowHeights: {},
        gridSize: { rows: 2, cols: 2 },
      },
      createdAt: 100,
      updatedAt: 100,
    };

    const initialState = {
      ...getInitialState(),
      documents: [doc],
    };

    const duplicateDocObj: Document = {
      ...doc,
      id: "doc-2",
      title: "Source Doc (Копия)",
    };

    const nextState = documentsReducer(
      initialState,
      duplicateDoc.fulfilled(duplicateDocObj, "req-3", "doc-1")
    );

    expect(nextState.documents.length).toBe(2);
    expect(nextState.documents[1].title).toBe("Source Doc (Копия)");
    expect(nextState.documents[1].id).toBe("doc-2");
  });

  it("should handle deleteDoc.fulfilled", () => {
    const doc: Document = {
      id: "doc-1",
      title: "Doc to Delete",
      userId: "user-michael",
      tableSnapshot: {
        gridSnapshot: { cells: {}, rowIds: [], colIds: [] },
        colWidths: {},
        rowHeights: {},
        gridSize: { rows: 2, cols: 2 },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const initialState = {
      ...getInitialState(),
      documents: [doc],
      activeDocumentId: "doc-1",
    };

    const nextState = documentsReducer(
      initialState,
      deleteDoc.fulfilled("doc-1", "req-4", "doc-1")
    );

    expect(nextState.documents.length).toBe(0);
    expect(nextState.activeDocumentId).toBeNull();
  });

  it("should handle setActiveDocumentId", () => {
    const initialState = getInitialState();
    const nextState = documentsReducer(
      initialState,
      documentsActions.setActiveDocumentId("doc-abc")
    );
    expect(nextState.activeDocumentId).toBe("doc-abc");
  });

  it("should handle importDoc.fulfilled", () => {
    const doc: Document = {
      id: "doc-1",
      title: "Imported Doc",
      userId: "user-michael",
      tableSnapshot: {
        gridSnapshot: { cells: {}, rowIds: [], colIds: [] },
        colWidths: {},
        rowHeights: {},
        gridSize: { rows: 2, cols: 2 },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const initialState = getInitialState();
    const nextState = documentsReducer(
      initialState,
      importDoc.fulfilled(doc, "req-5", doc)
    );

    expect(nextState.documents.length).toBe(1);
    expect(nextState.activeDocumentId).toBe("doc-1");
  });

  // Test extraReducers / Thunk actions using a test store
  it("should fetch documents thunk successfully", async () => {
    const testDocs = [
      {
        id: "1",
        title: "Doc 1",
        userId: "user-michael",
        tableSnapshot: {
          gridSize: { rows: 2, cols: 2 },
          gridSnapshot: { cells: {}, rowIds: [], colIds: [] },
        },
      },
      {
        id: "2",
        title: "Doc 2",
        userId: "user-michael",
        tableSnapshot: {
          gridSize: { rows: 2, cols: 2 },
          gridSnapshot: { cells: {}, rowIds: [], colIds: [] },
        },
      },
    ];
    localStorage.setItem("spreadsheet_docs", JSON.stringify(testDocs));

    const store = configureStore({
      reducer: { documents: documentsReducer },
    });

    const resultPromise = store.dispatch(fetchDocuments());

    await resultPromise;

    expect(store.getState().documents.documents.length).toBe(2);
    expect(store.getState().documents.documents[0].title).toBe("Doc 1");
  });

  it("should fetch document by id successfully", async () => {
    const doc: Document = {
      id: "doc-123",
      title: "Target Doc",
      userId: "user-michael",
      tableSnapshot: {
        gridSnapshot: { cells: {}, rowIds: [], colIds: [] },
        colWidths: {},
        rowHeights: {},
        gridSize: { rows: 2, cols: 2 },
      },
      createdAt: 100,
      updatedAt: 100,
    };
    localStorage.setItem("spreadsheet_docs", JSON.stringify([doc]));

    const store = configureStore({
      reducer: { documents: documentsReducer },
    });

    await store.dispatch(fetchDocumentById("doc-123"));

    expect(store.getState().documents.activeDocumentId).toBe("doc-123");
    expect(store.getState().documents.documents[0].title).toBe("Target Doc");
  });

  it("should fail to fetch document by id if not found", async () => {
    localStorage.setItem("spreadsheet_docs", JSON.stringify([]));

    const store = configureStore({
      reducer: { documents: documentsReducer },
    });

    const action = await store.dispatch(fetchDocumentById("non-existent"));

    expect(action.meta.requestStatus).toBe("rejected");
    expect(store.getState().documents.error).toBe("404");
  });

  it("should save document thunk successfully", async () => {
    const doc: Document = {
      id: "doc-123",
      title: "Doc to Save",
      userId: "user-michael",
      tableSnapshot: {
        gridSnapshot: { cells: {}, rowIds: [], colIds: [] },
        colWidths: {},
        rowHeights: {},
        gridSize: { rows: 2, cols: 2 },
      },
      createdAt: 100,
      updatedAt: 100,
    };
    localStorage.setItem("spreadsheet_docs", JSON.stringify([doc]));

    const store = configureStore({
      reducer: { documents: documentsReducer },
    });

    // Populate the documents list in state
    store.dispatch(importDoc.fulfilled(doc, "req-6", doc));

    const newSnapshot = {
      gridSnapshot: { cells: { r_c: "saved-val" }, rowIds: [], colIds: [] },
      colWidths: {},
      rowHeights: {},
      gridSize: { rows: 2, cols: 2 },
    };

    await store.dispatch(
      saveDocument({ id: "doc-123", snapshot: newSnapshot })
    );

    // Find the saved doc in store state
    const savedDoc = store
      .getState()
      .documents.documents.find((d) => d.id === "doc-123");
    expect(savedDoc?.tableSnapshot.gridSnapshot.cells["r_c"]).toBe("saved-val");

    // Check localStorage
    const stored = JSON.parse(localStorage.getItem("spreadsheet_docs") || "[]");
    expect(stored[0].tableSnapshot.gridSnapshot.cells["r_c"]).toBe("saved-val");
  });
});
