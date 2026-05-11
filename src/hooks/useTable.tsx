import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { evaluateCell } from "@/lib/formula";
import {
  type CellData,
  type CellPosition,
  getSelectionBounds,
  type TableSelection,
} from "@/lib/table";

type TableContextType = {
  selectedCell: CellPosition;
  selection: TableSelection;
  setSelectedCell: (cell: CellPosition) => void;
  setSelection: (selection: TableSelection) => void;
  clearSelection: () => void;

  data: Record<string, string>;
  updateCell: (cellId: string, value: string) => void;
  getCellData: (cellId: string) => CellData;

  insertColumn: (col: number, position: "left" | "right") => void;
  deleteColumn: (col: number) => void;
  insertRow: (row: number, position: "above" | "below") => void;
  deleteRow: (row: number) => void;

  rowHeights: Record<string, number>;
  colWidths: Record<string, number>;
  handleColResize: (colId: string, width: number) => void;
  handleRowResize: (rowId: string, height: number) => void;

  rowIds: string[];
  colIds: string[];
};

const TableContext = createContext<TableContextType | null>(null);

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
};

type TableSize = {
  rows: number;
  cols: number;
};

const defaultSelectedCell: CellPosition = {
  col: 0,
  row: 0,
};

const defaultSelection: TableSelection = {
  rowStart: 0,
  rowEnd: 0,
  colStart: 0,
  colEnd: 0,
};

const defaultGridSize: TableSize = {
  cols: 26,
  rows: 100,
};

type TableContextProviderProps = {
  children: ReactNode;
  gridSize?: TableSize;
  selectedCell?: CellPosition;
  selection?: TableSelection;
  onSelectedCellChange?: (value: CellPosition) => void;
  onSelectionChange?: (value: TableSelection) => void;
};

const generateIds = (count: number) =>
  Array.from({ length: count }, () => uuidv4());

export function TableContextProvider({
  children,
  gridSize: initGridSize = defaultGridSize,
  selectedCell: initSelected = defaultSelectedCell,
  selection: initSelection = defaultSelection,
  onSelectionChange,
  onSelectedCellChange,
}: TableContextProviderProps) {
  const [selectedCell, setSelectedCell] = useState(initSelected);
  const [selection, setSelection] = useState(initSelection);
  const [gridSize, setGridSize] = useState(initGridSize);
  const [rowIds, setRowIds] = useState<string[]>(generateIds(gridSize.rows));
  const [colIds, setColIds] = useState<string[]>(generateIds(gridSize.cols));
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const [data, setData] = useState<Record<string, string>>({});

  useEffect(() => {
    onSelectedCellChange?.(selectedCell);
  }, [selectedCell, onSelectedCellChange]);

  useEffect(() => {
    onSelectionChange?.(selection);
  }, [selection, onSelectionChange]);

  const handleColResize = (colId: string, width: number) => {
    setColWidths((prev) => ({ ...prev, [colId]: width }));
  };

  const handleRowResize = (rowId: string, height: number) => {
    setRowHeights((prev) => ({ ...prev, [rowId]: height }));
  };

  const insertColumn = (colIdx: number, position: "left" | "right") => {
    const newColIdx = position === "left" ? colIdx : colIdx + 1;
    const newColId = uuidv4();

    setColIds((prev) => [
      ...prev.slice(0, newColIdx),
      newColId,
      ...prev.slice(newColIdx),
    ]);

    setSelectedCell((prev) => ({
      row: prev.row,
      col: prev.col >= newColIdx ? prev.col + 1 : prev.col,
    }));

    setSelection((prev) => ({
      ...prev,
      colStart: prev.colStart >= newColIdx ? prev.colStart + 1 : prev.colStart,
      colEnd: prev.colEnd >= newColIdx ? prev.colEnd + 1 : prev.colEnd,
    }));

    setGridSize((prev) => ({ ...prev, cols: prev.cols + 1 }));
  };

  const insertRow = (rowIdx: number, position: "above" | "below") => {
    const newRowIdx = position === "above" ? rowIdx : rowIdx + 1;
    const newRowId = uuidv4();

    setRowIds((prev) => [
      ...prev.slice(0, newRowIdx),
      newRowId,
      ...prev.slice(newRowIdx),
    ]);

    setSelectedCell((prev) => ({
      row: prev.row >= newRowIdx ? prev.row + 1 : prev.row,
      col: prev.col,
    }));

    setSelection((prev) => ({
      ...prev,
      rowStart: prev.rowStart >= newRowIdx ? prev.rowStart + 1 : prev.rowStart,
      rowEnd: prev.rowEnd >= newRowIdx ? prev.rowEnd + 1 : prev.rowEnd,
    }));

    setGridSize((prev) => ({ ...prev, rows: prev.rows + 1 }));
  };

  const deleteColumn = (colIdx: number) => {
    if (colIds.length <= 1) return;

    const colIdToDelete = colIds[colIdx];

    setColIds((prev) => prev.filter((_, i) => i !== colIdx));

    setData((prev) => {
      const newData = { ...prev };
      Object.keys(newData).forEach((key) => {
        if (key.endsWith(`_${colIdToDelete}`)) {
          delete newData[key];
        }
      });
      return newData;
    });

    setColWidths((prev) => {
      const { [colIdToDelete]: _, ...rest } = prev;
      return rest;
    });

    const newMaxCol = colIds.length - 2;
    setSelectedCell((prev) => ({
      row: prev.row,
      col: Math.min(prev.col, newMaxCol),
    }));

    setSelection((prev) => ({
      ...prev,
      colStart: Math.min(prev.colStart, newMaxCol),
      colEnd: Math.min(prev.colEnd, newMaxCol),
    }));

    setGridSize((prev) => ({ ...prev, cols: prev.cols - 1 }));
  };

  const deleteRow = (rowIdx: number) => {
    if (rowIds.length <= 1) return;

    const rowIdToDelete = rowIds[rowIdx];

    setRowIds((prev) => prev.filter((_, i) => i !== rowIdx));

    setData((prev) => {
      const newData = { ...prev };
      Object.keys(newData).forEach((key) => {
        if (key.startsWith(`${rowIdToDelete}_`)) {
          delete newData[key];
        }
      });
      return newData;
    });

    setRowHeights((prev) => {
      const { [rowIdToDelete]: _, ...rest } = prev;
      return rest;
    });

    const newMaxRow = rowIds.length - 2;
    setSelectedCell((prev) => ({
      row: Math.min(prev.row, newMaxRow),
      col: prev.col,
    }));

    setSelection((prev) => ({
      ...prev,
      rowStart: Math.min(prev.rowStart, newMaxRow),
      rowEnd: Math.min(prev.rowEnd, newMaxRow),
    }));

    setGridSize((prev) => ({ ...prev, rows: prev.rows - 1 }));
  };

  const clearSelection = () => {
    setSelectedCell(defaultSelectedCell);
    setSelection(defaultSelection);
  };

  const setSelectionBounds = (selection: TableSelection) => {
    setSelection(getSelectionBounds(selection));
  };

  const updateCell = (cellId: string, value: string) => {
    setData((prev) => ({ ...prev, [cellId]: value }));
  };

  const getCellData = (cellId: string) => evaluateCell(cellId, data);

  return (
    <TableContext.Provider
      value={{
        clearSelection,
        selectedCell,
        setSelectedCell,
        selection,
        setSelection: setSelectionBounds,
        colWidths,
        handleColResize,
        rowHeights,
        handleRowResize,

        insertRow,
        insertColumn,
        deleteRow,
        deleteColumn,

        data,
        updateCell,
        getCellData,

        rowIds,
        colIds,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}
