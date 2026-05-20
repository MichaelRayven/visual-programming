import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { documentActions } from "../documentSlice";
import type { RootState } from "../index";
import { tableActions } from "../tableSlice";

export const autoSaveMiddleware = createListenerMiddleware();

autoSaveMiddleware.startListening({
  matcher: isAnyOf(
    tableActions.updateCell,
    tableActions.setColWidth,
    tableActions.setRowHeight,
    tableActions.setGridSize,
    tableActions.insertColumn,
    tableActions.deleteColumn,
    tableActions.insertRow,
    tableActions.deleteRow,
    tableActions.triggerSave
  ),
  effect: async (_, listenerApi) => {
    // Debounce saves
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(500);

    const state = listenerApi.getState() as RootState;
    const { openDocumentId } = state.document;

    if (!openDocumentId) return;

    listenerApi.dispatch(documentActions.setSaveStatus("saving"));

    try {
      const { gridSnapshot, gridSize, colWidths, rowHeights } = state.table;

      const snapshot = {
        gridSnapshot,
        gridSize,
        colWidths,
        rowHeights,
      };

      listenerApi.dispatch(
        documentActions.updateTableSnapshot({ id: openDocumentId, snapshot })
      );

      const updatedState = listenerApi.getState() as RootState;
      localStorage.setItem(
        "spreadsheet_docs",
        JSON.stringify(updatedState.document.documents)
      );

      // TODO: remove simulated network delay
      await listenerApi.delay(500);

      listenerApi.dispatch(documentActions.setSaveStatus("saved"));
    } catch (_error) {
      listenerApi.dispatch(documentActions.setSaveStatus("error"));
    }
  },
});

autoSaveMiddleware.startListening({
  matcher: isAnyOf(
    documentActions.createDocument,
    documentActions.updateDocument,
    documentActions.duplicateDocument,
    documentActions.deleteDocument,
    documentActions.importDocument
  ),
  effect: async (_, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    localStorage.setItem(
      "spreadsheet_docs",
      JSON.stringify(state.document.documents)
    );
  },
});
