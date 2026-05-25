import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
  type CellPosition,
  getSelectionBounds,
  type TableSelection,
} from "@/lib/table";
import { parseDateString } from "@/lib/utils";

export const DEFAULT_ROW_HEIGHT = 32;
export const DEFAULT_COL_WIDTH = 128;
export const MIN_ROW_HEIGHT = 32;
export const MIN_COL_WIDTH = 64;

export type CellStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  bgColor?: string;
  textColor?: string;
  align?: "left" | "center" | "right";
  format?: "number" | "percent" | "currency" | "date";
};

export type GridSnapshot = {
  cells: Record<string, string>;
  cellStyles?: Record<string, CellStyle>;
  rowIds: string[];
  colIds: string[];
};

export type TableSnapshot = {
  gridSnapshot: GridSnapshot;
  colWidths: Record<string, number>;
  rowHeights: Record<string, number>;
  gridSize: { rows: number; cols: number };
};

export type ClipboardCell = {
  rowOffset: number;
  colOffset: number;
  value: string;
  style?: CellStyle;
};

export type SpreadsheetState = TableSnapshot & {
  selectedCell: CellPosition;
  selection: TableSelection;
  past: TableSnapshot[];
  future: TableSnapshot[];
  clipboard: {
    cells: ClipboardCell[];
    isCut: boolean;
    sourceSelection?: TableSelection;
  } | null;
};

const initialState: SpreadsheetState = {
  gridSnapshot: {
    cells: {},
    cellStyles: {},
    rowIds: [],
    colIds: [],
  },
  colWidths: {},
  rowHeights: {},
  gridSize: { rows: 100, cols: 26 },
  selectedCell: { row: 0, col: 0 },
  selection: { rowStart: 0, rowEnd: 0, colStart: 0, colEnd: 0 },
  past: [],
  future: [],
  clipboard: null,
};

const getCellId = (state: SpreadsheetState, row: number, col: number) => {
  const rowId = state.gridSnapshot.rowIds[row];
  const colId = state.gridSnapshot.colIds[col];
  if (!rowId || !colId) return "";
  return `${rowId}_${colId}`;
};

const pushToHistory = (state: SpreadsheetState) => {
  const snapshot: TableSnapshot = {
    gridSnapshot: JSON.parse(JSON.stringify(state.gridSnapshot)),
    colWidths: { ...state.colWidths },
    rowHeights: { ...state.rowHeights },
    gridSize: { ...state.gridSize },
  };
  state.past.push(snapshot);
  if (state.past.length > 100) {
    state.past.shift();
  }
  state.future = [];
};

export const spreadsheetSlice = createSlice({
  name: "spreadsheet",
  initialState,
  reducers: {
    initTable: (state, action: PayloadAction<TableSnapshot>) => {
      state.gridSnapshot = JSON.parse(
        JSON.stringify(action.payload.gridSnapshot)
      );
      if (!state.gridSnapshot.cellStyles) {
        state.gridSnapshot.cellStyles = {};
      }
      state.colWidths = JSON.parse(
        JSON.stringify(action.payload.colWidths || {})
      );
      state.rowHeights = JSON.parse(
        JSON.stringify(action.payload.rowHeights || {})
      );
      state.gridSize = { ...action.payload.gridSize };
      state.selectedCell = { row: 0, col: 0 };
      state.selection = { rowStart: 0, rowEnd: 0, colStart: 0, colEnd: 0 };
      state.past = [];
      state.future = [];
    },
    updateCell: (
      state,
      action: PayloadAction<{ row: number; col: number; value: string }>
    ) => {
      const { row, col, value } = action.payload;
      const cellId = getCellId(state, row, col);
      if (!cellId) return;

      let finalValue = value;
      const style = state.gridSnapshot.cellStyles?.[cellId];
      if (
        style?.format === "date" &&
        value.trim() !== "" &&
        !value.startsWith("=")
      ) {
        const d = parseDateString(value);
        if (d) {
          const pad = (n: number) => String(n).padStart(2, "0");
          finalValue = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
        }
      }

      const currentValue = state.gridSnapshot.cells[cellId] || "";
      if (currentValue !== finalValue) {
        pushToHistory(state);
        state.gridSnapshot.cells[cellId] = finalValue;
      }
    },
    setSelectedCell: (state, action: PayloadAction<CellPosition>) => {
      state.selectedCell = action.payload;
    },
    setSelection: (state, action: PayloadAction<TableSelection>) => {
      state.selection = getSelectionBounds(action.payload);
    },
    clearSelection: (state) => {
      state.selectedCell = { row: 0, col: 0 };
      state.selection = { rowStart: 0, rowEnd: 0, colStart: 0, colEnd: 0 };
    },
    setColWidth: (
      state,
      action: PayloadAction<{ col: number; width: number }>
    ) => {
      const { col, width } = action.payload;
      const colId = state.gridSnapshot.colIds[col];
      if (!colId) return;

      const currentWidth = state.colWidths[colId] || DEFAULT_COL_WIDTH;
      const targetWidth = Math.max(width, MIN_COL_WIDTH);
      if (currentWidth !== targetWidth) {
        pushToHistory(state);
        state.colWidths[colId] = targetWidth;
      }
    },
    setRowHeight: (
      state,
      action: PayloadAction<{ row: number; height: number }>
    ) => {
      const { row, height } = action.payload;
      const rowId = state.gridSnapshot.rowIds[row];
      if (!rowId) return;

      const currentHeight = state.rowHeights[rowId] || DEFAULT_ROW_HEIGHT;
      const targetHeight = Math.max(height, MIN_ROW_HEIGHT);
      if (currentHeight !== targetHeight) {
        pushToHistory(state);
        state.rowHeights[rowId] = targetHeight;
      }
    },
    setGridSize: (
      state,
      action: PayloadAction<{ rows: number; cols: number }>
    ) => {
      const size = action.payload;
      pushToHistory(state);

      if (size.rows > state.gridSnapshot.rowIds.length) {
        while (state.gridSnapshot.rowIds.length < size.rows)
          state.gridSnapshot.rowIds.push(uuidv4());
      } else if (size.rows < state.gridSnapshot.rowIds.length) {
        state.gridSnapshot.rowIds.splice(size.rows);
      }
      if (size.cols > state.gridSnapshot.colIds.length) {
        while (state.gridSnapshot.colIds.length < size.cols)
          state.gridSnapshot.colIds.push(uuidv4());
      } else if (size.cols < state.gridSnapshot.colIds.length) {
        state.gridSnapshot.colIds.splice(size.cols);
      }
      state.gridSize = size;
    },
    insertColumn: (
      state,
      action: PayloadAction<{ col: number; position: "left" | "right" }>
    ) => {
      const { col, position } = action.payload;
      pushToHistory(state);

      const insertCol = position === "left" ? col : col + 1;
      state.gridSnapshot.colIds.splice(insertCol, 0, uuidv4());
      state.gridSize.cols += 1;

      if (state.selectedCell.col >= insertCol) {
        state.selectedCell.col += 1;
      }
      if (state.selection.colStart >= insertCol) state.selection.colStart += 1;
      if (state.selection.colEnd >= insertCol) state.selection.colEnd += 1;
    },
    deleteColumn: (state, action: PayloadAction<number>) => {
      const col = action.payload;
      if (state.gridSize.cols <= 1) return;
      pushToHistory(state);

      const colId = state.gridSnapshot.colIds[col];
      state.gridSnapshot.colIds.splice(col, 1);
      state.gridSize.cols -= 1;
      delete state.colWidths[colId];

      Object.keys(state.gridSnapshot.cells).forEach((key) => {
        if (key.endsWith(`_${colId}`)) {
          delete state.gridSnapshot.cells[key];
        }
      });

      if (state.selectedCell.col === col) {
        state.selectedCell.col = Math.min(
          state.selectedCell.col,
          state.gridSize.cols - 1
        );
      } else if (state.selectedCell.col > col) {
        state.selectedCell.col -= 1;
      }

      state.selection.colStart =
        state.selection.colStart > col
          ? state.selection.colStart - 1
          : Math.min(state.selection.colStart, state.gridSize.cols - 1);
      state.selection.colEnd =
        state.selection.colEnd > col
          ? state.selection.colEnd - 1
          : Math.min(state.selection.colEnd, state.gridSize.cols - 1);
    },
    insertRow: (
      state,
      action: PayloadAction<{ row: number; position: "above" | "below" }>
    ) => {
      const { row, position } = action.payload;
      pushToHistory(state);

      const insertRow = position === "above" ? row : row + 1;
      state.gridSnapshot.rowIds.splice(insertRow, 0, uuidv4());
      state.gridSize.rows += 1;

      if (state.selectedCell.row >= insertRow) {
        state.selectedCell.row += 1;
      }
      if (state.selection.rowStart >= insertRow) state.selection.rowStart += 1;
      if (state.selection.rowEnd >= insertRow) state.selection.rowEnd += 1;
    },
    deleteRow: (state, action: PayloadAction<number>) => {
      const row = action.payload;
      if (state.gridSize.rows <= 1) return;
      pushToHistory(state);

      const rowId = state.gridSnapshot.rowIds[row];
      state.gridSnapshot.rowIds.splice(row, 1);
      state.gridSize.rows -= 1;
      delete state.rowHeights[rowId];

      Object.keys(state.gridSnapshot.cells).forEach((key) => {
        if (key.startsWith(`${rowId}_`)) {
          delete state.gridSnapshot.cells[key];
        }
      });

      if (state.selectedCell.row === row) {
        state.selectedCell.row = Math.min(
          state.selectedCell.row,
          state.gridSize.rows - 1
        );
      } else if (state.selectedCell.row > row) {
        state.selectedCell.row -= 1;
      }

      state.selection.rowStart =
        state.selection.rowStart > row
          ? state.selection.rowStart - 1
          : Math.min(state.selection.rowStart, state.gridSize.rows - 1);
      state.selection.rowEnd =
        state.selection.rowEnd > row
          ? state.selection.rowEnd - 1
          : Math.min(state.selection.rowEnd, state.gridSize.rows - 1);
    },
    undo: (state) => {
      if (state.past.length === 0) return;
      const previous = state.past.pop()!;

      const currentSnapshot: TableSnapshot = {
        gridSnapshot: JSON.parse(JSON.stringify(state.gridSnapshot)),
        colWidths: { ...state.colWidths },
        rowHeights: { ...state.rowHeights },
        gridSize: { ...state.gridSize },
      };
      state.future.push(currentSnapshot);

      state.gridSnapshot = previous.gridSnapshot;
      state.colWidths = previous.colWidths;
      state.rowHeights = previous.rowHeights;
      state.gridSize = previous.gridSize;
    },
    redo: (state) => {
      if (state.future.length === 0) return;
      const next = state.future.pop()!;

      const currentSnapshot: TableSnapshot = {
        gridSnapshot: JSON.parse(JSON.stringify(state.gridSnapshot)),
        colWidths: { ...state.colWidths },
        rowHeights: { ...state.rowHeights },
        gridSize: { ...state.gridSize },
      };
      state.past.push(currentSnapshot);

      state.gridSnapshot = next.gridSnapshot;
      state.colWidths = next.colWidths;
      state.rowHeights = next.rowHeights;
      state.gridSize = next.gridSize;
    },
    toggleBold: (state) => {
      pushToHistory(state);
      const { rowStart, rowEnd, colStart, colEnd } = state.selection;
      if (!state.gridSnapshot.cellStyles) {
        state.gridSnapshot.cellStyles = {};
      }

      // Check if all selected cells are bold
      let allBold = true;
      const cellsToToggle: string[] = [];
      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cellId = getCellId(state, r, c);
          if (cellId) {
            cellsToToggle.push(cellId);
            const style = state.gridSnapshot.cellStyles[cellId];
            if (!style || !style.bold) {
              allBold = false;
            }
          }
        }
      }

      for (const cellId of cellsToToggle) {
        const style = state.gridSnapshot.cellStyles[cellId] || {};
        state.gridSnapshot.cellStyles[cellId] = {
          ...style,
          bold: !allBold,
        };
      }
    },
    toggleItalic: (state) => {
      pushToHistory(state);
      const { rowStart, rowEnd, colStart, colEnd } = state.selection;
      if (!state.gridSnapshot.cellStyles) {
        state.gridSnapshot.cellStyles = {};
      }

      let allItalic = true;
      const cellsToToggle: string[] = [];
      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cellId = getCellId(state, r, c);
          if (cellId) {
            cellsToToggle.push(cellId);
            const style = state.gridSnapshot.cellStyles[cellId];
            if (!style || !style.italic) {
              allItalic = false;
            }
          }
        }
      }

      for (const cellId of cellsToToggle) {
        const style = state.gridSnapshot.cellStyles[cellId] || {};
        state.gridSnapshot.cellStyles[cellId] = {
          ...style,
          italic: !allItalic,
        };
      }
    },
    toggleUnderline: (state) => {
      pushToHistory(state);
      const { rowStart, rowEnd, colStart, colEnd } = state.selection;
      if (!state.gridSnapshot.cellStyles) {
        state.gridSnapshot.cellStyles = {};
      }

      let allUnderline = true;
      const cellsToToggle: string[] = [];
      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cellId = getCellId(state, r, c);
          if (cellId) {
            cellsToToggle.push(cellId);
            const style = state.gridSnapshot.cellStyles[cellId];
            if (!style || !style.underline) {
              allUnderline = false;
            }
          }
        }
      }

      for (const cellId of cellsToToggle) {
        const style = state.gridSnapshot.cellStyles[cellId] || {};
        state.gridSnapshot.cellStyles[cellId] = {
          ...style,
          underline: !allUnderline,
        };
      }
    },
    setBgColor: (state, action: PayloadAction<string>) => {
      pushToHistory(state);
      const { rowStart, rowEnd, colStart, colEnd } = state.selection;
      if (!state.gridSnapshot.cellStyles) {
        state.gridSnapshot.cellStyles = {};
      }

      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cellId = getCellId(state, r, c);
          if (cellId) {
            const style = state.gridSnapshot.cellStyles[cellId] || {};
            state.gridSnapshot.cellStyles[cellId] = {
              ...style,
              bgColor: action.payload,
            };
          }
        }
      }
    },
    setTextColor: (state, action: PayloadAction<string>) => {
      pushToHistory(state);
      const { rowStart, rowEnd, colStart, colEnd } = state.selection;
      if (!state.gridSnapshot.cellStyles) {
        state.gridSnapshot.cellStyles = {};
      }

      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cellId = getCellId(state, r, c);
          if (cellId) {
            const style = state.gridSnapshot.cellStyles[cellId] || {};
            state.gridSnapshot.cellStyles[cellId] = {
              ...style,
              textColor: action.payload,
            };
          }
        }
      }
    },
    setAlign: (state, action: PayloadAction<CellStyle["align"]>) => {
      pushToHistory(state);
      const { rowStart, rowEnd, colStart, colEnd } = state.selection;
      if (!state.gridSnapshot.cellStyles) {
        state.gridSnapshot.cellStyles = {};
      }

      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cellId = getCellId(state, r, c);
          if (cellId) {
            const style = state.gridSnapshot.cellStyles[cellId] || {};
            state.gridSnapshot.cellStyles[cellId] = {
              ...style,
              align: action.payload,
            };
          }
        }
      }
    },
    setFormat: (state, action: PayloadAction<CellStyle["format"]>) => {
      pushToHistory(state);
      const { rowStart, rowEnd, colStart, colEnd } = state.selection;
      if (!state.gridSnapshot.cellStyles) {
        state.gridSnapshot.cellStyles = {};
      }

      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cellId = getCellId(state, r, c);
          if (cellId) {
            const style = state.gridSnapshot.cellStyles[cellId] || {};
            state.gridSnapshot.cellStyles[cellId] = {
              ...style,
              format: action.payload,
            };

            // Convert current cell value if setting to date format
            if (action.payload === "date") {
              const value = state.gridSnapshot.cells[cellId] || "";
              if (value.trim() !== "" && !value.startsWith("=")) {
                const d = parseDateString(value);
                if (d) {
                  const pad = (n: number) => String(n).padStart(2, "0");
                  state.gridSnapshot.cells[cellId] =
                    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
                }
              }
            }
          }
        }
      }
    },
    copySelection: (state) => {
      const { rowStart, rowEnd, colStart, colEnd } = state.selection;
      const clipboardCells: ClipboardCell[] = [];

      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cellId = getCellId(state, r, c);
          if (!cellId) continue;

          clipboardCells.push({
            rowOffset: r - rowStart,
            colOffset: c - colStart,
            value: state.gridSnapshot.cells[cellId] || "",
            style: state.gridSnapshot.cellStyles?.[cellId]
              ? { ...state.gridSnapshot.cellStyles[cellId] }
              : undefined,
          });
        }
      }

      state.clipboard = {
        cells: clipboardCells,
        isCut: false,
      };
    },
    cutSelection: (state) => {
      const { rowStart, rowEnd, colStart, colEnd } = state.selection;
      const clipboardCells: ClipboardCell[] = [];

      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cellId = getCellId(state, r, c);
          if (!cellId) continue;

          clipboardCells.push({
            rowOffset: r - rowStart,
            colOffset: c - colStart,
            value: state.gridSnapshot.cells[cellId] || "",
            style: state.gridSnapshot.cellStyles?.[cellId]
              ? { ...state.gridSnapshot.cellStyles[cellId] }
              : undefined,
          });
        }
      }

      state.clipboard = {
        cells: clipboardCells,
        isCut: true,
        sourceSelection: { ...state.selection },
      };
    },
    pasteSelection: (state) => {
      if (!state.clipboard) return;
      pushToHistory(state);

      const targetRow = state.selectedCell.row;
      const targetCol = state.selectedCell.col;

      // If we cut, we need to clear the source selection
      if (state.clipboard.isCut && state.clipboard.sourceSelection) {
        const src = state.clipboard.sourceSelection;
        for (let r = src.rowStart; r <= src.rowEnd; r++) {
          for (let c = src.colStart; c <= src.colEnd; c++) {
            const cellId = getCellId(state, r, c);
            if (cellId) {
              delete state.gridSnapshot.cells[cellId];
              if (state.gridSnapshot.cellStyles) {
                delete state.gridSnapshot.cellStyles[cellId];
              }
            }
          }
        }
      }

      // Now paste the copied cells
      for (const item of state.clipboard.cells) {
        const r = targetRow + item.rowOffset;
        const c = targetCol + item.colOffset;

        // Check bounds
        if (r >= state.gridSize.rows || c >= state.gridSize.cols) continue;

        const cellId = getCellId(state, r, c);
        if (!cellId) continue;

        if (item.value !== "") {
          state.gridSnapshot.cells[cellId] = item.value;
        } else {
          delete state.gridSnapshot.cells[cellId];
        }

        if (item.style) {
          if (!state.gridSnapshot.cellStyles) {
            state.gridSnapshot.cellStyles = {};
          }
          state.gridSnapshot.cellStyles[cellId] = { ...item.style };
        } else {
          if (state.gridSnapshot.cellStyles) {
            delete state.gridSnapshot.cellStyles[cellId];
          }
        }
      }

      // Clear clipboard if it was a cut
      if (state.clipboard.isCut) {
        state.clipboard = null;
      }
    },
    clearSelectedCells: (state) => {
      pushToHistory(state);
      const { rowStart, rowEnd, colStart, colEnd } = state.selection;
      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cellId = getCellId(state, r, c);
          if (cellId) {
            delete state.gridSnapshot.cells[cellId];
            if (state.gridSnapshot.cellStyles) {
              delete state.gridSnapshot.cellStyles[cellId];
            }
          }
        }
      }
    },
    selectAll: (state) => {
      state.selection = {
        rowStart: 0,
        rowEnd: state.gridSize.rows - 1,
        colStart: 0,
        colEnd: state.gridSize.cols - 1,
      };
    },
    triggerSave: () => {
      // no-op, just to trigger middleware
    },
  },
});

export const spreadsheetActions = spreadsheetSlice.actions;
export default spreadsheetSlice.reducer;
