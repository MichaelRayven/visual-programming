import clsx from "clsx";
import { TableContext, useTable } from "@/hooks/useTable";
import {
  type CellPosition,
  getCellId,
  getColumnHeader,
  getSelectionBounds,
  isCellInSelection,
  isColumnHeaderInSelection,
  isRowHeaderInSelection,
  type TableSelection,
} from "@/lib/table";
import "@/components/table.css";
import { useEffect, useRef, useState } from "react";
import { evaluateCell } from "@/lib/formula";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";
import { Input } from "./input";

const MIN_COLUMN_WIDTH = 64;
const MIN_ROW_HEIGHT = 32;

const initSelected = {
  col: 0,
  row: 0,
};

const initSelection = {
  rowStart: 0,
  rowEnd: 0,
  colStart: 0,
  colEnd: 0,
};

type TableProps = {
  size: {
    rows: number;
    cols: number;
  };
} & React.ComponentProps<"table">;

export const Table = ({ size, className, ...props }: TableProps) => {
  const selectedInputRef = useRef<HTMLInputElement>(null);
  const [gridSize, setGridSize] = useState(size);
  const [selectedCell, setSelectedCell] = useState<CellPosition>(initSelected);
  const [selection, setSelection] = useState<TableSelection>(initSelection);
  const [colWidths, setColWidths] = useState<Record<number, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const [data, setData] = useState<Record<string, string>>({});

  useEffect(() => {
    setGridSize(size);
  }, [size]);

  const handleColResize = (col: number, width: number) => {
    setColWidths((prev) => ({ ...prev, [col]: width }));
  };

  const handleRowResize = (row: number, height: number) => {
    setRowHeights((prev) => ({ ...prev, [row]: height }));
  };

  const updateCell = (cellId: string, value: string) => {
    setData((prev) => ({ ...prev, [cellId]: value }));
  };

  const getCellData = (cellId: string) => {
    return evaluateCell(cellId, data);
  };

  const setSelectionBounds = (selection: TableSelection) => {
    setSelection(getSelectionBounds(selection));
  };

  const clearSelection = () => {
    setSelectedCell(initSelected);
    setSelection(initSelection);
  };

  const insertColumn = (colIndex: number, position: "left" | "right") => {
    const insertCol = position === "left" ? colIndex : colIndex + 1;
    const newCols = gridSize.cols + 1;

    setData((prevData) => {
      const nextData: Record<string, string> = {};
      for (let r = 0; r < gridSize.rows; r++) {
        for (let c = 0; c < newCols; c++) {
          if (c < insertCol) {
            const id = getCellId(r, c);
            if (prevData[id] !== undefined) nextData[id] = prevData[id];
          } else if (c > insertCol) {
            const oldId = getCellId(r, c - 1);
            const newId = getCellId(r, c);
            if (prevData[oldId] !== undefined)
              nextData[newId] = prevData[oldId];
          }
        }
      }
      return nextData;
    });

    setColWidths((prevWidths) => {
      const nextWidths: Record<number, number> = {};
      Object.entries(prevWidths).forEach(([key, val]) => {
        const c = Number(key);
        if (c < insertCol) {
          nextWidths[c] = val;
        } else {
          nextWidths[c + 1] = val;
        }
      });
      return nextWidths;
    });

    setSelectedCell((prev) => {
      if (!prev) return prev;
      return {
        row: prev.row,
        col: prev.col >= insertCol ? prev.col + 1 : prev.col,
      };
    });

    setSelection((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        colStart:
          prev.colStart >= insertCol ? prev.colStart + 1 : prev.colStart,
        colEnd: prev.colEnd >= insertCol ? prev.colEnd + 1 : prev.colEnd,
      };
    });

    setGridSize((prev) => ({ ...prev, cols: newCols }));
  };

  const deleteColumn = (colIndex: number) => {
    if (gridSize.cols <= 1) return;
    const newCols = gridSize.cols - 1;

    setData((prevData) => {
      const nextData: Record<string, string> = {};
      for (let r = 0; r < gridSize.rows; r++) {
        for (let c = 0; c < newCols; c++) {
          if (c < colIndex) {
            const id = getCellId(r, c);
            if (prevData[id] !== undefined) nextData[id] = prevData[id];
          } else {
            const oldId = getCellId(r, c + 1);
            const newId = getCellId(r, c);
            if (prevData[oldId] !== undefined)
              nextData[newId] = prevData[oldId];
          }
        }
      }
      return nextData;
    });

    setColWidths((prevWidths) => {
      const nextWidths: Record<number, number> = {};
      Object.entries(prevWidths).forEach(([key, val]) => {
        const c = Number(key);
        if (c < colIndex) {
          nextWidths[c] = val;
        } else if (c > colIndex) {
          nextWidths[c - 1] = val;
        }
      });
      return nextWidths;
    });

    setSelectedCell((prev) => {
      if (!prev) return prev;
      let nextCol = prev.col;
      if (prev.col === colIndex) {
        nextCol = Math.min(prev.col, newCols - 1);
      } else if (prev.col > colIndex) {
        nextCol = prev.col - 1;
      }
      return { row: prev.row, col: nextCol };
    });

    setSelection((prev) => {
      if (!prev) return prev;
      const colStart =
        prev.colStart > colIndex
          ? prev.colStart - 1
          : Math.min(prev.colStart, newCols - 1);
      const colEnd =
        prev.colEnd > colIndex
          ? prev.colEnd - 1
          : Math.min(prev.colEnd, newCols - 1);
      return {
        ...prev,
        colStart,
        colEnd,
      };
    });

    setGridSize((prev) => ({ ...prev, cols: newCols }));
  };

  const insertRow = (rowIndex: number, position: "above" | "below") => {
    const insertRowIdx = position === "above" ? rowIndex : rowIndex + 1;
    const newRows = gridSize.rows + 1;

    setData((prevData) => {
      const nextData: Record<string, string> = {};
      for (let r = 0; r < newRows; r++) {
        for (let c = 0; c < gridSize.cols; c++) {
          if (r < insertRowIdx) {
            const id = getCellId(r, c);
            if (prevData[id] !== undefined) nextData[id] = prevData[id];
          } else if (r > insertRowIdx) {
            const oldId = getCellId(r - 1, c);
            const newId = getCellId(r, c);
            if (prevData[oldId] !== undefined)
              nextData[newId] = prevData[oldId];
          }
        }
      }
      return nextData;
    });

    setRowHeights((prevHeights) => {
      const nextHeights: Record<number, number> = {};
      Object.entries(prevHeights).forEach(([key, val]) => {
        const r = Number(key);
        if (r < insertRowIdx) {
          nextHeights[r] = val;
        } else {
          nextHeights[r + 1] = val;
        }
      });
      return nextHeights;
    });

    setSelectedCell((prev) => {
      if (!prev) return prev;
      return {
        col: prev.col,
        row: prev.row >= insertRowIdx ? prev.row + 1 : prev.row,
      };
    });

    setSelection((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rowStart:
          prev.rowStart >= insertRowIdx ? prev.rowStart + 1 : prev.rowStart,
        rowEnd: prev.rowEnd >= insertRowIdx ? prev.rowEnd + 1 : prev.rowEnd,
      };
    });

    setGridSize((prev) => ({ ...prev, rows: newRows }));
  };

  const deleteRow = (rowIndex: number) => {
    if (gridSize.rows <= 1) return; // Prevent deleting last row
    const newRows = gridSize.rows - 1;

    // 1. Shift cell data up over the deleted index
    setData((prevData) => {
      const nextData: Record<string, string> = {};
      for (let r = 0; r < newRows; r++) {
        for (let c = 0; c < gridSize.cols; c++) {
          if (r < rowIndex) {
            const id = getCellId(r, c);
            if (prevData[id] !== undefined) nextData[id] = prevData[id];
          } else {
            const oldId = getCellId(r + 1, c);
            const newId = getCellId(r, c);
            if (prevData[oldId] !== undefined)
              nextData[newId] = prevData[oldId];
          }
        }
      }
      return nextData;
    });

    // 2. Shift saved row heights up
    setRowHeights((prevHeights) => {
      const nextHeights: Record<number, number> = {};
      Object.entries(prevHeights).forEach(([key, val]) => {
        const r = Number(key);
        if (r < rowIndex) {
          nextHeights[r] = val;
        } else if (r > rowIndex) {
          nextHeights[r - 1] = val;
        }
      });
      return nextHeights;
    });

    // 3. Update/Clamp active selections
    setSelectedCell((prev) => {
      if (!prev) return prev;
      let nextRow = prev.row;
      if (prev.row === rowIndex) {
        nextRow = Math.min(prev.row, newRows - 1);
      } else if (prev.row > rowIndex) {
        nextRow = prev.row - 1;
      }
      return { col: prev.col, row: nextRow };
    });

    setSelection((prev) => {
      if (!prev) return prev;
      const rowStart =
        prev.rowStart > rowIndex
          ? prev.rowStart - 1
          : Math.min(prev.rowStart, newRows - 1);
      const rowEnd =
        prev.rowEnd > rowIndex
          ? prev.rowEnd - 1
          : Math.min(prev.rowEnd, newRows - 1);
      return {
        ...prev,
        rowStart,
        rowEnd,
      };
    });

    setGridSize((prev) => ({ ...prev, rows: newRows }));
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      if (e.key === "Enter") {
        e.preventDefault();

        selectedInputRef.current?.focus();
      } else if (e.key === "Tab") {
        e.preventDefault();

        selectedInputRef.current?.blur();
        if (selectedCell.col + 1 < gridSize.cols) {
          setSelectedCell({
            col: selectedCell.col + 1,
            row: selectedCell.row,
          });
          setSelection({
            rowStart: selectedCell.row,
            colStart: selectedCell.col + 1,
            rowEnd: selectedCell.row,
            colEnd: selectedCell.col + 1,
          });
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selectedCell, gridSize]);

  return (
    <TableContext.Provider
      value={{
        selectedCell,
        selection,
        setSelectedCell,
        setSelection: setSelectionBounds,
        clearSelection,
        data,
        updateCell,
        getCellData,
        insertColumn,
        deleteColumn,
        insertRow,
        deleteRow,
      }}
    >
      <div className="table-wrapper">
        <TableTopBar />

        <div className="table-scrollable">
          <table className={clsx("table", className)} {...props}>
            {/* A-Z column headers */}
            <TableRow>
              <TableHeader />
              {Array.from({ length: gridSize.cols }).map((_, col) => (
                <TableHeader
                  key={col}
                  col={col}
                  style={
                    colWidths[col]
                      ? { width: colWidths[col], minWidth: colWidths[col] }
                      : undefined
                  }
                  onResize={(width) => handleColResize(col, width)}
                >
                  {getColumnHeader(col)}
                </TableHeader>
              ))}
            </TableRow>
            {Array.from({ length: gridSize.rows }).map((_, row) => (
              <TableRow
                key={row}
                style={
                  rowHeights[row] ? { height: rowHeights[row] } : undefined
                }
              >
                <TableHeader
                  row={row}
                  onResize={(height) => handleRowResize(row, height)}
                >
                  {row + 1}
                </TableHeader>
                {Array.from({ length: gridSize.cols }).map((_, col) => {
                  const isSelectedCell =
                    col === selectedCell?.col && row === selectedCell?.row;
                  return (
                    <TableCell
                      key={col}
                      row={row}
                      col={col}
                      inputRef={isSelectedCell ? selectedInputRef : undefined}
                    />
                  );
                })}
              </TableRow>
            ))}
          </table>
        </div>
      </div>
    </TableContext.Provider>
  );
};

type TableRowProps = {} & React.ComponentProps<"tr">;

export const TableRow = ({ className, ...props }: TableRowProps) => {
  return <tr className={clsx("table-row", className)} {...props} />;
};

type TableHeaderProps = {
  col?: number;
  row?: number;
  onResize?: (size: number) => void;
} & React.ComponentProps<"th">;

export const TableHeader = ({
  className,
  col,
  row,
  onResize,
  children,
  ...props
}: TableHeaderProps) => {
  const { selection, insertColumn, deleteColumn, insertRow, deleteRow } =
    useTable();
  const ref = useRef<HTMLTableCellElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = ref.current ? ref.current.offsetWidth : 0;
    const startHeight = ref.current ? ref.current.offsetHeight : 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (col !== undefined && onResize) {
        const newWidth = Math.max(
          MIN_COLUMN_WIDTH,
          startWidth + (moveEvent.clientX - startX)
        );
        onResize(newWidth);
      } else if (row !== undefined && onResize) {
        const newHeight = Math.max(
          MIN_ROW_HEIGHT,
          startHeight + (moveEvent.clientY - startY)
        );
        onResize(newHeight);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const isCol = col !== undefined;
  const isRow = row !== undefined;

  return (
    <th
      ref={ref}
      className={clsx(
        "table-header",
        {
          "header-selected":
            (isCol && isColumnHeaderInSelection(selection, col)) ||
            (isRow && isRowHeaderInSelection(selection, row)),
        },
        className
      )}
      {...props}
    >
      <ContextMenu>
        <ContextMenuTrigger className="table-header-content">
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isCol && (
            <>
              <ContextMenuItem onClick={() => insertColumn(col, "left")}>
                Insert column left
              </ContextMenuItem>
              <ContextMenuItem onClick={() => insertColumn(col, "right")}>
                Insert column right
              </ContextMenuItem>
              <ContextMenuItem onClick={() => deleteColumn(col)}>
                Delete column
              </ContextMenuItem>
            </>
          )}
          {isRow && (
            <>
              <ContextMenuItem onClick={() => insertRow(row, "above")}>
                Insert row above
              </ContextMenuItem>
              <ContextMenuItem onClick={() => insertRow(row, "below")}>
                Insert row below
              </ContextMenuItem>
              <ContextMenuItem onClick={() => deleteRow(row)}>
                Delete row
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      {isCol && (
        <div
          className="col-resizer"
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "6px",
            cursor: "col-resize",
            zIndex: 10,
          }}
        />
      )}
      {isRow && (
        <div
          className="row-resizer"
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "6px",
            cursor: "row-resize",
            zIndex: 10,
          }}
        />
      )}
    </th>
  );
};

type TableCellProps = {
  row: number;
  col: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
} & React.ComponentProps<"td">;

export const TableCell = ({
  className,
  row,
  col,
  onClick,
  inputRef,
  onDoubleClick,
  ...props
}: TableCellProps) => {
  const {
    selection,
    selectedCell,
    setSelection,
    setSelectedCell,
    updateCell,
    getCellData,
  } = useTable();
  const [isFocused, setIsFocused] = useState(false);
  const internalInputRef = useRef<HTMLInputElement>(null);

  const cellId = getCellId(row, col);
  const { value, rawValue } = getCellData(cellId);

  const isInSelection = isCellInSelection(selection, row, col);
  const isSelectedCell = col === selectedCell?.col && row === selectedCell?.row;
  const currentInputRef = inputRef || internalInputRef;

  // Display raw value if this cell is selected
  const displayValue = isFocused ? rawValue : String(value);

  return (
    <td
      className={clsx(
        "table-cell",
        {
          selected: isSelectedCell,
          selection: isInSelection,
          "selection-row-start": row === selection?.rowStart,
          "selection-row-end": row === selection?.rowEnd,
          "selection-col-start": col === selection?.colStart,
          "selection-col-end": col === selection?.colEnd,
        },
        className
      )}
      onDoubleClick={(e) => {
        currentInputRef.current?.focus();
        onDoubleClick?.(e);
      }}
      onClick={(e) => {
        if (e.shiftKey && selectedCell) {
          setSelection({
            rowStart: selectedCell.row,
            colStart: selectedCell.col,
            rowEnd: row,
            colEnd: col,
          });
        } else {
          setSelectedCell({ row, col });
          setSelection({
            rowStart: row,
            colStart: col,
            rowEnd: row,
            colEnd: col,
          });
        }

        onClick?.(e);
      }}
      {...props}
    >
      <Input
        ref={currentInputRef}
        className="table-cell-input"
        value={displayValue}
        onChange={(e) => updateCell(cellId, e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </td>
  );
};

export function TableTopBar() {
  const { selectedCell, getCellData, updateCell } = useTable();

  const cellId = getCellId(selectedCell.row, selectedCell.col);
  const { rawValue } = getCellData(cellId);

  return (
    <div className="table-top-bar">
      <div className="table-top-bar-address">{cellId}</div>
      <Input
        className="table-top-bar-input"
        value={rawValue}
        onChange={(e) => updateCell(cellId, e.target.value)}
      />
    </div>
  );
}
