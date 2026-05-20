import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
  type CellPosition,
  getSelectionBounds,
  type TableSelection,
} from "@/lib/table";

export const DEFAULT_ROW_HEIGHT = 32;
export const DEFAULT_COL_WIDTH = 128;
export const MIN_ROW_HEIGHT = 32;
export const MIN_COL_WIDTH = 64;

export type GridSnapshot = {
  cells: Record<string, string>;
  rowIds: string[];
  colIds: string[];
};

export type TableSnapshot = {
  gridSnapshot: GridSnapshot;
  colWidths: Record<string, number>;
  rowHeights: Record<string, number>;
  gridSize: { rows: number; cols: number };
};

export type TableState = TableSnapshot & {
  selectedCell: CellPosition;
  selection: TableSelection;
};

const initialState: TableState = {
  gridSnapshot: {
    cells: {},
    rowIds: [],
    colIds: [],
  },
  colWidths: {},
  rowHeights: {},
  gridSize: { rows: 100, cols: 26 },
  selectedCell: { row: 0, col: 0 },
  selection: { rowStart: 0, rowEnd: 0, colStart: 0, colEnd: 0 },
};

const getCellId = (state: TableState, row: number, col: number) =>
  `${state.gridSnapshot.rowIds[row]}_${state.gridSnapshot.colIds[col]}`;

export const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    initTable: (state, action: PayloadAction<TableSnapshot>) => {
      state.gridSnapshot = action.payload.gridSnapshot;
      state.colWidths = action.payload.colWidths;
      state.rowHeights = action.payload.rowHeights;
      state.gridSize = action.payload.gridSize;
      state.selectedCell = { row: 0, col: 0 };
      state.selection = { rowStart: 0, rowEnd: 0, colStart: 0, colEnd: 0 };
    },
    updateCell: (
      state,
      action: PayloadAction<{ row: number; col: number; value: string }>
    ) => {
      const { row, col, value } = action.payload;
      const cellId = getCellId(state, row, col);
      state.gridSnapshot.cells[cellId] = value;
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
      state.colWidths[colId] = Math.max(width, MIN_COL_WIDTH);
    },
    setRowHeight: (
      state,
      action: PayloadAction<{ row: number; height: number }>
    ) => {
      const { row, height } = action.payload;
      const rowId = state.gridSnapshot.rowIds[row];
      state.rowHeights[rowId] = Math.max(height, MIN_ROW_HEIGHT);
    },
    setGridSize: (
      state,
      action: PayloadAction<{ rows: number; cols: number }>
    ) => {
      const size = action.payload;
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
      const colId = state.gridSnapshot.colIds[col];

      state.gridSnapshot.colIds.splice(col, 1);
      state.gridSize.cols -= 1;
      delete state.colWidths[colId];

      // Remove cells
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
      const rowId = state.gridSnapshot.rowIds[row];

      state.gridSnapshot.rowIds.splice(row, 1);
      state.gridSize.rows -= 1;
      delete state.rowHeights[rowId];

      // Remove cells
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
    triggerSave: () => {
      // no-op, just to trigger middleware
    },
  },
});

export const tableActions = tableSlice.actions;
export default tableSlice.reducer;
