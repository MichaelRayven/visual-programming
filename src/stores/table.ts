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

export type Listener = () => void;

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

export class TableStore {
  private gridSnapshot: GridSnapshot;
  private gridSize: { rows: number; cols: number };
  private selectedCell: CellPosition = { row: 0, col: 0 };
  private selection: TableSelection = {
    rowStart: 0,
    rowEnd: 0,
    colStart: 0,
    colEnd: 0,
  };
  private colWidths: Record<string, number> = {};
  private rowHeights: Record<string, number> = {};

  private globalListeners = new Set<Listener>();
  private cellListeners = new Map<string, Set<Listener>>();
  private selectionListeners = new Set<Listener>();
  private gridMetaListeners = new Set<Listener>();

  constructor(initialSize: { rows: number; cols: number }) {
    this.gridSize = { ...initialSize };
    this.gridSnapshot = {
      cells: {},
      rowIds: Array.from({ length: initialSize.rows }, () => uuidv4()),
      colIds: Array.from({ length: initialSize.cols }, () => uuidv4()),
    };
  }

  // Subs
  subscribe(listener: Listener) {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  subscribeCell(row: number, col: number, listener: Listener) {
    const cellId = this.getCellId(row, col);

    if (!this.cellListeners.has(cellId)) {
      this.cellListeners.set(cellId, new Set());
    }
    this.cellListeners.get(cellId)!.add(listener);
    return () => {
      const set = this.cellListeners.get(cellId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) this.cellListeners.delete(cellId);
      }
    };
  }

  subscribeSelection(listener: Listener) {
    this.selectionListeners.add(listener);
    return () => {
      this.selectionListeners.delete(listener);
    };
  }

  subscribeGridMeta(listener: Listener) {
    this.gridMetaListeners.add(listener);
    return () => {
      this.gridMetaListeners.delete(listener);
    };
  }

  // Getters
  getGridSnapshot = (): GridSnapshot => this.gridSnapshot;
  getGridSizeSnapshot = () => this.gridSize;
  getSelectedCellSnapshot = () => this.selectedCell;
  getSelectionSnapshot = () => this.selection;
  getColWidthsSnapshot = () => this.colWidths;
  getRowHeightsSnapshot = () => this.rowHeights;

  getCellId = (row: number, col: number) =>
    `${this.gridSnapshot.rowIds[row]}_${this.gridSnapshot.colIds[col]}`;
  getCellValue = (row: number, col: number) =>
    this.gridSnapshot.cells[this.getCellId(row, col)] || "";
  getColWidth = (col: number) =>
    this.colWidths[this.gridSnapshot.colIds[col]] || DEFAULT_COL_WIDTH;
  getRowHeight = (row: number) =>
    this.rowHeights[this.gridSnapshot.rowIds[row]] || DEFAULT_ROW_HEIGHT;

  // Setters
  loadSavedTable({
    gridSnapshot,
    colWidths,
    rowHeights,
    gridSize,
  }: TableSnapshot) {
    this.gridSnapshot = gridSnapshot;
    this.colWidths = colWidths;
    this.rowHeights = rowHeights;
    this.gridSize = gridSize;
    this.notifyAll();
  }

  updateCell(row: number, col: number, value: string) {
    const cellId = this.getCellId(row, col);
    if (this.gridSnapshot.cells[cellId] === value) return;

    this.gridSnapshot = {
      ...this.gridSnapshot,
      cells: {
        ...this.gridSnapshot.cells,
        [cellId]: value,
      },
    };
    this.cellListeners.get(cellId)?.forEach((l) => l());
    this.globalListeners.forEach((l) => l());
  }

  setSelectedCell(cell: CellPosition) {
    if (
      this.selectedCell.row === cell.row &&
      this.selectedCell.col === cell.col
    )
      return;
    this.selectedCell = cell;
    this.selectionListeners.forEach((l) => l());
  }

  setSelection(sel: TableSelection) {
    const bounded = getSelectionBounds(sel);
    if (
      this.selection.rowStart === bounded.rowStart &&
      this.selection.rowEnd === bounded.rowEnd &&
      this.selection.colStart === bounded.colStart &&
      this.selection.colEnd === bounded.colEnd
    )
      return;
    this.selection = bounded;
    this.selectionListeners.forEach((l) => l());
  }

  clearSelection() {
    this.selectedCell = { row: 0, col: 0 };
    this.selection = { rowStart: 0, rowEnd: 0, colStart: 0, colEnd: 0 };
    this.selectionListeners.forEach((l) => l());
  }

  setColWidth(col: number, width: number) {
    const colId = this.gridSnapshot.colIds[col];
    if (this.colWidths[colId] === width) return;
    this.colWidths = {
      ...this.colWidths,
      [colId]: Math.max(width, MIN_COL_WIDTH),
    };
    this.gridMetaListeners.forEach((l) => l());
    this.globalListeners.forEach((l) => l());
  }

  setRowHeight(row: number, height: number) {
    const rowId = this.gridSnapshot.rowIds[row];
    if (this.rowHeights[rowId] === height) return;
    this.rowHeights = {
      ...this.rowHeights,
      [rowId]: Math.max(height, MIN_ROW_HEIGHT),
    };
    this.gridMetaListeners.forEach((l) => l());
    this.globalListeners.forEach((l) => l());
  }

  setGridSize(size: { rows: number; cols: number }) {
    if (this.gridSize.rows === size.rows && this.gridSize.cols === size.cols)
      return;
    this.gridSize = { ...size };
    this.gridMetaListeners.forEach((l) => l());
  }

  insertColumn(col: number, position: "left" | "right") {
    const insertCol = position === "left" ? col : col + 1;
    const newCols = this.gridSize.cols + 1;

    this.gridSnapshot = {
      ...this.gridSnapshot,
      colIds: [
        ...this.gridSnapshot.colIds.slice(0, insertCol),
        uuidv4(),
        ...this.gridSnapshot.colIds.slice(insertCol),
      ],
    };

    if (this.selectedCell) {
      this.selectedCell = {
        row: this.selectedCell.row,
        col:
          this.selectedCell.col >= insertCol
            ? this.selectedCell.col + 1
            : this.selectedCell.col,
      };
    }
    if (this.selection) {
      this.selection = {
        ...this.selection,
        colStart:
          this.selection.colStart >= insertCol
            ? this.selection.colStart + 1
            : this.selection.colStart,
        colEnd:
          this.selection.colEnd >= insertCol
            ? this.selection.colEnd + 1
            : this.selection.colEnd,
      };
    }

    this.gridSize = { ...this.gridSize, cols: newCols };
    this.notifyAll();
  }

  deleteColumn(col: number) {
    if (this.gridSize.cols <= 1) return;
    const newCols = this.gridSize.cols - 1;

    this.gridSnapshot = {
      cells: Object.fromEntries(
        Object.entries(this.gridSnapshot.cells).filter(
          ([key, _]) => !key.endsWith(this.gridSnapshot.colIds[col])
        )
      ),
      rowIds: this.gridSnapshot.rowIds,
      colIds: this.gridSnapshot.colIds.filter((_, idx) => idx !== col),
    };

    const { [this.gridSnapshot.colIds[col]]: _, ...nextWidths } =
      this.colWidths;
    this.colWidths = nextWidths;

    if (this.selectedCell) {
      let nextCol = this.selectedCell.col;
      if (this.selectedCell.col === col) {
        nextCol = Math.min(this.selectedCell.col, newCols - 1);
      } else if (this.selectedCell.col > col) {
        nextCol = this.selectedCell.col - 1;
      }
      this.selectedCell = { row: this.selectedCell.row, col: nextCol };
    }
    if (this.selection) {
      const colStart =
        this.selection.colStart > col
          ? this.selection.colStart - 1
          : Math.min(this.selection.colStart, newCols - 1);
      const colEnd =
        this.selection.colEnd > col
          ? this.selection.colEnd - 1
          : Math.min(this.selection.colEnd, newCols - 1);
      this.selection = { ...this.selection, colStart, colEnd };
    }

    this.gridSize = { ...this.gridSize, cols: newCols };
    this.notifyAll();
  }

  insertRow(row: number, position: "above" | "below") {
    const insertRow = position === "above" ? row : row + 1;
    const newRows = this.gridSize.rows + 1;

    this.gridSnapshot = {
      ...this.gridSnapshot,
      rowIds: [
        ...this.gridSnapshot.rowIds.slice(0, insertRow),
        uuidv4(),
        ...this.gridSnapshot.rowIds.slice(insertRow),
      ],
    };

    if (this.selectedCell) {
      this.selectedCell = {
        col: this.selectedCell.col,
        row:
          this.selectedCell.row >= insertRow
            ? this.selectedCell.row + 1
            : this.selectedCell.row,
      };
    }
    if (this.selection) {
      this.selection = {
        ...this.selection,
        rowStart:
          this.selection.rowStart >= insertRow
            ? this.selection.rowStart + 1
            : this.selection.rowStart,
        rowEnd:
          this.selection.rowEnd >= insertRow
            ? this.selection.rowEnd + 1
            : this.selection.rowEnd,
      };
    }

    this.gridSize = { ...this.gridSize, rows: newRows };
    this.notifyAll();
  }

  deleteRow(row: number) {
    if (this.gridSize.rows <= 1) return;
    const newRows = this.gridSize.rows - 1;

    this.gridSnapshot = {
      cells: Object.fromEntries(
        Object.entries(this.gridSnapshot.cells).filter(
          ([key, _]) => !key.startsWith(this.gridSnapshot.rowIds[row])
        )
      ),
      rowIds: this.gridSnapshot.rowIds.filter((_, idx) => idx !== row),
      colIds: this.gridSnapshot.colIds,
    };

    const { [this.gridSnapshot.rowIds[row]]: _, ...nextHeights } =
      this.rowHeights;
    this.rowHeights = nextHeights;

    if (this.selectedCell) {
      let nextRow = this.selectedCell.row;
      if (this.selectedCell.row === row) {
        nextRow = Math.min(this.selectedCell.row, newRows - 1);
      } else if (this.selectedCell.row > row) {
        nextRow = this.selectedCell.row - 1;
      }
      this.selectedCell = { col: this.selectedCell.col, row: nextRow };
    }
    if (this.selection) {
      const rowStart =
        this.selection.rowStart > row
          ? this.selection.rowStart - 1
          : Math.min(this.selection.rowStart, newRows - 1);
      const rowEnd =
        this.selection.rowEnd > row
          ? this.selection.rowEnd - 1
          : Math.min(this.selection.rowEnd, newRows - 1);
      this.selection = { ...this.selection, rowStart, rowEnd };
    }

    this.gridSize = { ...this.gridSize, rows: newRows };
    this.notifyAll();
  }

  private notifyAll() {
    this.gridMetaListeners.forEach((l) => l());
    this.selectionListeners.forEach((l) => l());
    this.globalListeners.forEach((l) => l());
  }
}
