import clsx from "clsx";
import { TableContext, useTable } from "@/hooks/useTable";
import {
  getColumnHeader,
  getSelectionBounds,
  isCellInSelection,
  isColumnHeaderInSelection,
  isRowHeaderInSelection,
  type SelectedCell,
  type TableSelection,
} from "@/lib/table";
import "@/components/table.css";
import { useEffect, useRef, useState } from "react";
import { Input } from "./input";

type TableProps = {
  size: {
    rows: number;
    cols: number;
  };
} & React.ComponentProps<"table">;

export const Table = ({ size, className, ...props }: TableProps) => {
  const selectedInputRef = useRef<HTMLInputElement>(null);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [tableSelection, setTableSelection] = useState<TableSelection | null>(
    null
  );

  const setSelectionBounds = (selection: TableSelection | null) => {
    setTableSelection(selection ? getSelectionBounds(selection) : null);
  };

  const clearSelection = () => {
    setSelectedCell(null);
    setTableSelection(null);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      if (e.key === "Enter" && selectedCell) {
        e.preventDefault();
        selectedInputRef.current?.focus();
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (selectedCell.col + 1 < size.cols) {
          setSelectedCell({
            col: selectedCell.col + 1,
            row: selectedCell.row,
          });
          setTableSelection({
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
        selection: tableSelection,
        setSelectedCell,
        setSelection: setSelectionBounds,
        clearSelection,
      }}
    >
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
  const { selection, selectedCell, setSelection, setSelectedCell } = useTable();
  const internalInputRef = useRef<HTMLInputElement>(null);

  const isInSelection = isCellInSelection(selection, row, col);
  const isSelectedCell = col === selectedCell?.col && row === selectedCell?.row;
  const currentInputRef = inputRef || internalInputRef;

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
      <Input ref={currentInputRef} className="table-cell-input" />
    </td>
  );
};
