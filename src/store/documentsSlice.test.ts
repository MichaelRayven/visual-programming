import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it } from "vitest";
import documentsReducer, {
  type Document,
  type DocumentsState,
  documentsActions,
  fetchDocumentById,
  fetchDocuments,
  saveDocument,
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
  beforeEach(() => {
    localStorage.clear();
  });

  const getInitialState = (): DocumentsState => ({
    documents: [],
    activeDocumentId: null,
    loadingStatus: "idle",
    error: null,
  });

  it("should return the initial state", () => {
    expect(documentsReducer(undefined, { type: "" })).toEqual(
      getInitialState()
    );
  });

  it("should handle createDocument", () => {
    const initialState = getInitialState();
    const nextState = documentsReducer(
      initialState,
      documentsActions.createDocument({ title: "New Doc", rows: 10, cols: 5 })
    );

    expect(nextState.documents.length).toBe(1);
    expect(nextState.documents[0].title).toBe("New Doc");
    expect(nextState.documents[0].tableSnapshot.gridSize).toEqual({
      rows: 10,
      cols: 5,
    });
    expect(localStorage.getItem("spreadsheet_docs")).toBeDefined();
  });

  it("should handle updateDocument", () => {
    const doc: Document = {
      id: "doc-1",
      title: "Old Title",
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
      documentsActions.updateDocument({ id: "doc-1", title: "New Title" })
    );

    expect(nextState.documents[0].title).toBe("New Title");
  });

  it("should handle duplicateDocument", () => {
    const doc: Document = {
      id: "doc-1",
      title: "Source Doc",
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

    const nextState = documentsReducer(
      initialState,
      documentsActions.duplicateDocument("doc-1")
    );

    expect(nextState.documents.length).toBe(2);
    expect(nextState.documents[1].title).toBe("Source Doc (Копия)");
    expect(nextState.documents[1].id).not.toBe("doc-1");
    expect(nextState.documents[1].tableSnapshot.gridSnapshot.cells["r_c"]).toBe(
      "hello"
    );
  });

  it("should handle deleteDocument", () => {
    const doc: Document = {
      id: "doc-1",
      title: "Doc to Delete",
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
      documentsActions.deleteDocument("doc-1")
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

  it("should handle importDocument", () => {
    const doc: Document = {
      id: "doc-1",
      title: "Imported Doc",
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
      documentsActions.importDocument(doc)
    );

    expect(nextState.documents.length).toBe(1);
    expect(nextState.activeDocumentId).toBe("doc-1");
  });

  // Test extraReducers / Thunk actions using a test store
  it("should fetch documents thunk successfully", async () => {
    const testDocs = [
      { id: "1", title: "Doc 1" },
      { id: "2", title: "Doc 2" },
    ];
    localStorage.setItem("spreadsheet_docs", JSON.stringify(testDocs));

    const store = configureStore({
      reducer: { documents: documentsReducer },
    });

    const resultPromise = store.dispatch(fetchDocuments());

    // verify loading status is loading
    expect(store.getState().documents.loadingStatus).toBe("loading");

    await resultPromise;

    expect(store.getState().documents.loadingStatus).toBe("succeeded");
    expect(store.getState().documents.documents.length).toBe(2);
    expect(store.getState().documents.documents[0].title).toBe("Doc 1");
  });

  it("should fetch document by id successfully", async () => {
    const doc: Document = {
      id: "doc-123",
      title: "Target Doc",
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

    expect(store.getState().documents.loadingStatus).toBe("succeeded");
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
    expect(store.getState().documents.loadingStatus).toBe("failed");
    expect(store.getState().documents.error).toBe("Document not found");
  });

  it("should save document thunk successfully", async () => {
    const doc: Document = {
      id: "doc-123",
      title: "Doc to Save",
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
    store.dispatch(documentsActions.importDocument(doc));

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
