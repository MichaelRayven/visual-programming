import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { documentsActions } from "../documentsSlice";
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
    spreadsheetActions.undo,
    spreadsheetActions.redo,
    spreadsheetActions.toggleBold,
    spreadsheetActions.toggleItalic,
    spreadsheetActions.toggleUnderline,
    spreadsheetActions.setBgColor,
    spreadsheetActions.setTextColor,
    spreadsheetActions.setAlign,
    spreadsheetActions.setFormat,
    spreadsheetActions.pasteSelection,
    spreadsheetActions.clearSelectedCells,
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

      await listenerApi.dispatch(
        documentsActions.saveDocument({ id: activeDocumentId, snapshot })
      );
    } catch (_e) {
      // Errors are caught and handled by the thunk/extraReducers
    }
  },
});
