import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { saveDocument } from "../documentsSlice";
import type { RootState } from "../index";
import { spreadsheetActions } from "../spreadsheetSlice";

export const autoSaveMiddleware = createListenerMiddleware();

autoSaveMiddleware.startListening({
  matcher: isAnyOf(
    spreadsheetActions.updateCell,
    spreadsheetActions.setColWidth,
    spreadsheetActions.setRowHeight,
    spreadsheetActions.setGridSize,
    spreadsheetActions.insertColumn,
    spreadsheetActions.deleteColumn,
    spreadsheetActions.insertRow,
    spreadsheetActions.deleteRow,
    spreadsheetActions.triggerSave
  ),
  effect: async (_, listenerApi) => {
    // Debounce saves
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(500);

    const state = listenerApi.getState() as RootState;
    const { activeDocumentId } = state.documents;

    if (!activeDocumentId) return;

    try {
      const { gridSnapshot, gridSize, colWidths, rowHeights } =
        state.spreadsheet;

      const snapshot = {
        gridSnapshot,
        gridSize,
        colWidths,
        rowHeights,
      };

      // Dispatch the saveDocument async thunk!
      await listenerApi.dispatch(
        saveDocument({ id: activeDocumentId, snapshot })
      );
    } catch (_error) {
      // Errors are caught and handled by the thunk/extraReducers
    }
  },
});
