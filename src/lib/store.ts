import { v4 as uuidv4 } from "uuid";
import {
  type CellPosition,
  getSelectionBounds,
  type TableSelection,
} from "./table";

export const DEFAULT_ROW_HEIGHT = 32;
export const DEFAULT_COL_WIDTH = 64;

export type Listener = () => void;

export type GridSnapshot = {
  cells: Record<string, string>;
  rowIds: string[];
  colIds: string[];
};

export class TableStore {
  private snapshot: GridSnapshot;
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
    this.snapshot = {
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
  getGridSnapshot = (): GridSnapshot => this.snapshot;
  getGridSizeSnapshot = () => this.gridSize;
  getSelectedCellSnapshot = () => this.selectedCell;
  getSelectionSnapshot = () => this.selection;
  getColWidthsSnapshot = () => this.colWidths;
  getRowHeightsSnapshot = () => this.rowHeights;

  getCellId = (row: number, col: number) =>
    `${this.snapshot.rowIds[row]}_${this.snapshot.colIds[col]}`;
  getCellValue = (row: number, col: number) =>
    this.snapshot.cells[this.getCellId(row, col)] || "";
  getColWidth = (col: number) => this.colWidths[this.snapshot.colIds[col]];
  getRowHeight = (row: number) => this.rowHeights[this.snapshot.rowIds[row]];

  // Setters
  updateCell(row: number, col: number, value: string) {
    const cellId = this.getCellId(row, col);
    if (this.snapshot.cells[cellId] === value) return;

    this.snapshot = {
      ...this.snapshot,
      cells: {
        ...this.snapshot.cells,
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
    if (this.colWidths[col] === width) return;
    this.colWidths = { ...this.colWidths, [col]: width };
    this.gridMetaListeners.forEach((l) => l());
  }

  setRowHeight(row: number, height: number) {
    if (this.rowHeights[row] === height) return;
    this.rowHeights = { ...this.rowHeights, [row]: height };
    this.gridMetaListeners.forEach((l) => l());
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

    this.snapshot = {
      ...this.snapshot,
      colIds: [
        ...this.snapshot.colIds.slice(0, insertCol),
        uuidv4(),
        ...this.snapshot.colIds.slice(insertCol),
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

    this.snapshot = {
      cells: Object.fromEntries(
        Object.entries(this.snapshot.cells).filter(
          ([key, _]) => !key.endsWith(this.snapshot.colIds[col])
        )
      ),
      rowIds: this.snapshot.rowIds,
      colIds: this.snapshot.colIds.filter((_, idx) => idx !== col),
    };

    const { [this.snapshot.colIds[col]]: _, ...nextWidths } = this.colWidths;
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

    this.snapshot = {
      ...this.snapshot,
      rowIds: [
        ...this.snapshot.rowIds.slice(0, insertRow),
        uuidv4(),
        ...this.snapshot.rowIds.slice(insertRow),
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

    this.snapshot = {
      cells: Object.fromEntries(
        Object.entries(this.snapshot.cells).filter(
          ([key, _]) => !key.startsWith(this.snapshot.rowIds[row])
        )
      ),
      rowIds: this.snapshot.rowIds.filter((_, idx) => idx !== row),
      colIds: this.snapshot.colIds,
    };

    const { [this.snapshot.rowIds[row]]: _, ...nextHeights } = this.rowHeights;
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
