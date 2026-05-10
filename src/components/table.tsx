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
import { Input } from "./input";

type TableProps = {
  size: {
    rows: number;
    cols: number;
  };
} & React.ComponentProps<"table">;

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

export const Table = ({ size, className, ...props }: TableProps) => {
  const selectedInputRef = useRef<HTMLInputElement>(null);
  const [selectedCell, setSelectedCell] = useState<CellPosition>(initSelected);
  const [selection, setSelection] = useState<TableSelection>(initSelection);
  const [data, setData] = useState<Record<string, string>>({});

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

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      if (e.key === "Enter") {
        e.preventDefault();

        selectedInputRef.current?.focus();
      } else if (e.key === "Tab") {
        e.preventDefault();

        selectedInputRef.current?.blur();
        if (selectedCell.col + 1 < size.cols) {
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
  }, [selectedCell, size]);

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
      }}
    >
      <div className="table-wrapper">
        <TableTopBar />

        <div className="table-scrollable">
          <table className={clsx("table", className)} {...props}>
            {/* A-Z column headers */}
            <TableRow>
              <TableHeader />
              {Array.from({ length: size.cols }).map((_, col) => (
                <TableHeader key={col} col={col}>
                  {getColumnHeader(col)}
                </TableHeader>
              ))}
            </TableRow>
            {Array.from({ length: size.rows }).map((_, row) => (
              <TableRow key={row}>
                <TableHeader row={row}>{row + 1}</TableHeader>
                {Array.from({ length: size.cols }).map((_, col) => {
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
} & React.ComponentProps<"th">;

export const TableHeader = ({
  className,
  col,
  row,
  ...props
}: TableHeaderProps) => {
  const { selection } = useTable();
  return (
    <th
      className={clsx(
        "table-header",
        {
          "header-selected":
            (col && isColumnHeaderInSelection(selection, col)) ||
            (row && isRowHeaderInSelection(selection, row)),
        },
        className
      )}
      {...props}
    />
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
