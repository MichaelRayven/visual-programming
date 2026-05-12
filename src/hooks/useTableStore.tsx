import { useCallback, useSyncExternalStore } from "react";
import { useStore } from "@/hooks/useTable";
import { evaluateCell } from "@/lib/formula";
import {
  getCellAddress,
  isCellInSelection,
  isColumnHeaderInSelection,
  isRowHeaderInSelection,
} from "@/lib/table";

export function useGridSize() {
  const store = useStore();
  return useSyncExternalStore(
    (l) => store.subscribeGridMeta(l),
    () => store.getGridSizeSnapshot()
  );
}

export function useSelection() {
  const store = useStore();
  return useSyncExternalStore(
    (l) => store.subscribeSelection(l),
    () => store.getSelectionSnapshot()
  );
}

export function useSelectedCell() {
  const store = useStore();
  return useSyncExternalStore(
    (l) => store.subscribeSelection(l),
    () => store.getSelectedCellSnapshot()
  );
}

export function useColWidth(col?: number) {
  const store = useStore();
  return useSyncExternalStore(
    // biome-ignore lint/suspicious/noEmptyBlockStatements: No-op for undefined cols
    (l) => (col !== undefined ? store.subscribeGridMeta(l) : () => {}),
    () => (col !== undefined ? store.getColWidth(col) : undefined)
  );
}

export function useRowHeight(row?: number) {
  const store = useStore();
  return useSyncExternalStore(
    // biome-ignore lint/suspicious/noEmptyBlockStatements: No-op for undefined rows
    (l) => (row !== undefined ? store.subscribeGridMeta(l) : () => {}),
    () => (row !== undefined ? store.getRowHeight(row) : undefined)
  );
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
  const store = useStore();

  const rawValue = useSyncExternalStore(
    (l) => store.subscribeCell(row, col, l),
    () => store.getCellValue(row, col)
  );
  const isFormula = rawValue.startsWith("=");

  const snapshot = useSyncExternalStore(
    (l) => {
      if (isFormula) {
        return store.subscribe(l);
      }
      // biome-ignore lint/suspicious/noEmptyBlockStatements: No-op for static data
      return () => {};
    },
    () => store.getDataSnapshot()
  );

  const displayValue = evaluateCell(getCellAddress(row, col), snapshot).value;

  return {
    rawValue,
    displayValue,
  };
}
