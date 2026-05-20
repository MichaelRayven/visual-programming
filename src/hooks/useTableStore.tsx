import { useDispatch, useSelector } from "react-redux";
import { evaluateCell } from "@/lib/formula";
import {
  getCellAddress,
  isCellInSelection,
  isColumnHeaderInSelection,
  isRowHeaderInSelection,
} from "@/lib/table";
import type { AppDispatch, RootState } from "@/store";
import {
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT,
  tableActions,
} from "@/store/tableSlice";

export const useTableStore = () => {
  const dispatch = useDispatch<AppDispatch>();

  return {
    updateCell: (row: number, col: number, value: string) =>
      dispatch(tableActions.updateCell({ row, col, value })),
    setSelectedCell: (cell: { row: number; col: number }) =>
      dispatch(tableActions.setSelectedCell(cell)),
    setSelection: (sel: {
      rowStart: number;
      colStart: number;
      rowEnd: number;
      colEnd: number;
    }) => dispatch(tableActions.setSelection(sel)),
    clearSelection: () => dispatch(tableActions.clearSelection()),
    setColWidth: (col: number, width: number) =>
      dispatch(tableActions.setColWidth({ col, width })),
    setRowHeight: (row: number, height: number) =>
      dispatch(tableActions.setRowHeight({ row, height })),
    setGridSize: (size: { rows: number; cols: number }) =>
      dispatch(tableActions.setGridSize(size)),
    insertColumn: (col: number, position: "left" | "right") =>
      dispatch(tableActions.insertColumn({ col, position })),
    deleteColumn: (col: number) => dispatch(tableActions.deleteColumn(col)),
    insertRow: (row: number, position: "above" | "below") =>
      dispatch(tableActions.insertRow({ row, position })),
    deleteRow: (row: number) => dispatch(tableActions.deleteRow(row)),
  };
};

export function useGridSize() {
  return useSelector((state: RootState) => state.table.gridSize);
}

export function useSelection() {
  return useSelector((state: RootState) => state.table.selection);
}

export function useSelectedCell() {
  return useSelector((state: RootState) => state.table.selectedCell);
}

export function useColWidth(col: number) {
  return useSelector((state: RootState) => {
    const colId = state.table.gridSnapshot.colIds[col];
    return state.table.colWidths[colId] || DEFAULT_COL_WIDTH;
  });
}

export function useRowHeight(row: number) {
  return useSelector((state: RootState) => {
    const rowId = state.table.gridSnapshot.rowIds[row];
    return state.table.rowHeights[rowId] || DEFAULT_ROW_HEIGHT;
  });
}

export function useHeaderSelected(col?: number, row?: number) {
  const selection = useSelection();
  if (col !== undefined) return isColumnHeaderInSelection(selection, col);
  if (row !== undefined) return isRowHeaderInSelection(selection, row);
  return false;
}

export function useCellSelection(row: number, col: number) {
  const selection = useSelection();
  const selectedCell = useSelectedCell();

  return {
    isSelected: selectedCell.row === row && selectedCell.col === col,
    isInSelection: isCellInSelection(selection, row, col),
    isRowStart: row === selection.rowStart,
    isRowEnd: row === selection.rowEnd,
    isColStart: col === selection.colStart,
    isColEnd: col === selection.colEnd,
  };
}

export function useCellData(row: number, col: number) {
  const rawValue = useSelector((state: RootState) => {
    const rowId = state.table.gridSnapshot.rowIds[row];
    const colId = state.table.gridSnapshot.colIds[col];
    if (!rowId || !colId) return "";
    return state.table.gridSnapshot.cells[`${rowId}_${colId}`] || "";
  });

  const isFormula = rawValue.startsWith("=");

  const snapshot = useSelector((state: RootState) => {
    return isFormula ? state.table.gridSnapshot : null;
  });

  const displayValue =
    isFormula && snapshot
      ? evaluateCell(getCellAddress(row, col), snapshot).value
      : rawValue;

  return {
    rawValue,
    displayValue,
  };
}
