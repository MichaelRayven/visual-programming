import { createContext, useContext, useSyncExternalStore } from "react";
import { evaluateCell } from "@/lib/formula";
import {
  getCellAddress,
  isCellInSelection,
  isColumnHeaderInSelection,
  isRowHeaderInSelection,
} from "@/lib/table";
import { TableStore } from "@/stores/table";

export const TableStoreContext = createContext<TableStore | null>(null);

export const useTableStore = () => {
  const store = useContext(TableStoreContext);
  if (!store)
    throw new Error("useStore must be used within TableStoreProvider");
  return store;
};

export function useGridSize() {
  const store = useTableStore();
  return useSyncExternalStore(
    (l) => store.subscribeGridMeta(l),
    () => store.getGridSizeSnapshot()
  );
}

export function useSelection() {
  const store = useTableStore();
  return useSyncExternalStore(
    (l) => store.subscribeSelection(l),
    () => store.getSelectionSnapshot()
  );
}

export function useSelectedCell() {
  const store = useTableStore();
  return useSyncExternalStore(
    (l) => store.subscribeSelection(l),
    () => store.getSelectedCellSnapshot()
  );
}

export function useColWidth(col: number) {
  const store = useTableStore();
  return useSyncExternalStore(
    (l) => store.subscribeGridMeta(l),
    () => store.getColWidth(col)
  );
}

export function useRowHeight(row: number) {
  const store = useTableStore();
  return useSyncExternalStore(
    (l) => store.subscribeGridMeta(l),
    () => store.getRowHeight(row)
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
  const store = useTableStore();

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
    () => store.getGridSnapshot()
  );

  const displayValue = evaluateCell(getCellAddress(row, col), snapshot).value;

  return {
    rawValue,
    displayValue,
  };
}
