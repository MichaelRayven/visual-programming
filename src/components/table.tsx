import clsx from "clsx";
import { TableContextProvider, useTable } from "@/hooks/useTable";
import {
  getColumnHeader,
  isCellInSelection,
  isColumnHeaderInSelection,
  isRowHeaderInSelection,
} from "@/lib/table";
import "@/components/table.css";
import { useEffect, useRef } from "react";
import { Input } from "./input";

type TableProps = {
  size: {
    rows: number;
    cols: number;
  };
} & React.ComponentProps<"table">;

export const Table = ({ size, className, ...props }: TableProps) => {
  return (
    <TableContextProvider>
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
              return <TableCell key={col} row={row} col={col} />;
            })}
          </TableRow>
        ))}
      </table>
    </TableContextProvider>
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

type TableCellProps = { row: number; col: number } & React.ComponentProps<"td">;

export const TableCell = ({
  className,
  row,
  col,
  onClick,
  onDoubleClick,
  ...props
}: TableCellProps) => {
  const { selection, selectedCell, setSelection, setSelectedCell } = useTable();
  const inputRef = useRef<HTMLInputElement>(null);

  const isInSelection = isCellInSelection(selection, row, col);
  const isSelectedCell = col === selectedCell?.col && row === selectedCell?.row;

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !isSelectedCell) return;

      if (e.key === "Enter") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Tab") {
        e.preventDefault();
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
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selectedCell, setSelectedCell, isSelectedCell]);

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
        inputRef.current?.focus();
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
      <Input ref={inputRef} className="table-cell-input" />
    </td>
  );
};
