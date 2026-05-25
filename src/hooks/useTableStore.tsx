import { useMemo } from "react";
import { shallowEqual } from "react-redux";
import { evaluateCell } from "@/lib/formula";
import {
  getCellAddress,
  isCellInSelection,
  isColumnHeaderInSelection,
  isRowHeaderInSelection,
} from "@/lib/table";
import { formatValue } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  type CellStyle,
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT,
  spreadsheetActions,
} from "@/store/spreadsheetSlice";

export const useTableStore = () => {
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      updateCell: (row: number, col: number, value: string) =>
        dispatch(spreadsheetActions.updateCell({ row, col, value })),
      setSelectedCell: (cell: { row: number; col: number }) =>
        dispatch(spreadsheetActions.setSelectedCell(cell)),
      setSelection: (sel: {
        rowStart: number;
        colStart: number;
        rowEnd: number;
        colEnd: number;
      }) => dispatch(spreadsheetActions.setSelection(sel)),
      clearSelection: () => dispatch(spreadsheetActions.clearSelection()),
      setColWidth: (col: number, width: number) =>
        dispatch(spreadsheetActions.setColWidth({ col, width })),
      setRowHeight: (row: number, height: number) =>
        dispatch(spreadsheetActions.setRowHeight({ row, height })),
      setGridSize: (size: { rows: number; cols: number }) =>
        dispatch(spreadsheetActions.setGridSize(size)),
      insertColumn: (col: number, position: "left" | "right") =>
        dispatch(spreadsheetActions.insertColumn({ col, position })),
      deleteColumn: (col: number) =>
        dispatch(spreadsheetActions.deleteColumn(col)),
      insertRow: (row: number, position: "above" | "below") =>
        dispatch(spreadsheetActions.insertRow({ row, position })),
      deleteRow: (row: number) => dispatch(spreadsheetActions.deleteRow(row)),
      undo: () => dispatch(spreadsheetActions.undo()),
      redo: () => dispatch(spreadsheetActions.redo()),
      toggleBold: () => dispatch(spreadsheetActions.toggleBold()),
      toggleItalic: () => dispatch(spreadsheetActions.toggleItalic()),
      toggleUnderline: () => dispatch(spreadsheetActions.toggleUnderline()),
      setBgColor: (color: string) =>
        dispatch(spreadsheetActions.setBgColor(color)),
      setTextColor: (color: string) =>
        dispatch(spreadsheetActions.setTextColor(color)),
      setAlign: (align: CellStyle["align"]) =>
        dispatch(spreadsheetActions.setAlign(align)),
      setFormat: (format: CellStyle["format"]) =>
        dispatch(spreadsheetActions.setFormat(format)),
      copySelection: () => dispatch(spreadsheetActions.copySelection()),
      cutSelection: () => dispatch(spreadsheetActions.cutSelection()),
      pasteSelection: () => dispatch(spreadsheetActions.pasteSelection()),
      clearSelectedCells: () =>
        dispatch(spreadsheetActions.clearSelectedCells()),
      selectAll: () => dispatch(spreadsheetActions.selectAll()),
    }),
    [dispatch]
  );
};

export function useGridSize() {
  return useAppSelector((state) => state.spreadsheet.gridSize);
}

export function useSelection() {
  return useAppSelector((state) => state.spreadsheet.selection);
}

export function useSelectedCell() {
  return useAppSelector((state) => state.spreadsheet.selectedCell);
}

export function useColWidth(col: number) {
  return useAppSelector((state) => {
    const colId = state.spreadsheet.gridSnapshot.colIds[col];
    return state.spreadsheet.colWidths[colId] || DEFAULT_COL_WIDTH;
  });
}

export function useRowHeight(row: number) {
  return useAppSelector((state) => {
    const rowId = state.spreadsheet.gridSnapshot.rowIds[row];
    return state.spreadsheet.rowHeights[rowId] || DEFAULT_ROW_HEIGHT;
  });
}

export function useHeaderSelected(col?: number, row?: number) {
  return useAppSelector((state) => {
    const selection = state.spreadsheet.selection;
    if (col !== undefined) return isColumnHeaderInSelection(selection, col);
    if (row !== undefined) return isRowHeaderInSelection(selection, row);
    return false;
  });
}

export function useCellSelection(row: number, col: number) {
  return useAppSelector((state) => {
    const isSelected =
      state.spreadsheet.selectedCell.row === row &&
      state.spreadsheet.selectedCell.col === col;

    const isInSelection = isCellInSelection(
      state.spreadsheet.selection,
      row,
      col
    );

    const isRowStart =
      isInSelection && row === state.spreadsheet.selection.rowStart;
    const isRowEnd =
      isInSelection && row === state.spreadsheet.selection.rowEnd;
    const isColStart =
      isInSelection && col === state.spreadsheet.selection.colStart;
    const isColEnd =
      isInSelection && col === state.spreadsheet.selection.colEnd;

    return {
      isSelected,
      isInSelection,
      isRowStart,
      isRowEnd,
      isColStart,
      isColEnd,
    };
  }, shallowEqual);
}

export function useCellData(row: number, col: number) {
  const cellInfo = useAppSelector((state) => {
    const rowId = state.spreadsheet.gridSnapshot.rowIds[row];
    const colId = state.spreadsheet.gridSnapshot.colIds[col];
    if (!rowId || !colId) return { rawValue: "", format: undefined };
    const cellId = `${rowId}_${colId}`;
    return {
      rawValue: state.spreadsheet.gridSnapshot.cells[cellId] || "",
      format: state.spreadsheet.gridSnapshot.cellStyles?.[cellId]?.format,
    };
  }, shallowEqual);

  const { rawValue, format } = cellInfo;
  const isFormula = rawValue.startsWith("=");

  const snapshot = useAppSelector((state) => {
    return isFormula ? state.spreadsheet.gridSnapshot : null;
  });

  const evaluated =
    isFormula && snapshot
      ? evaluateCell(getCellAddress(row, col), snapshot).value
      : rawValue;

  const displayValue = formatValue(evaluated, format);

  return {
    rawValue,
    displayValue,
  };
}

export function useActiveCellStyles() {
  const selectedCell = useSelectedCell();
  return useAppSelector((state) => {
    const rowId = state.spreadsheet.gridSnapshot.rowIds[selectedCell.row];
    const colId = state.spreadsheet.gridSnapshot.colIds[selectedCell.col];
    if (!rowId || !colId) return {};
    return (
      state.spreadsheet.gridSnapshot.cellStyles?.[`${rowId}_${colId}`] || {}
    );
  }, shallowEqual);
}
