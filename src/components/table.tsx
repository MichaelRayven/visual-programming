import clsx from "clsx";
import { TableContextProvider, useTable } from "@/hooks/useTable";
import {
  isCellInSelection,
  isColumnHeaderInSelection,
  isRowHeaderInSelection,
} from "@/lib/table";
import "./table.css";

type TableProps = {
  size: {
    rows: number;
    cols: number;
  };
} & React.ComponentProps<"table">;

export const Table = ({ size, className, ...props }: TableProps) => {
  const getColumnHeader = (idx: number) => {
    let remainder = idx;
    let header = "";
    while (remainder >= 0) {
      header = String.fromCharCode(65 + (remainder % 26)) + header;
      remainder = Math.floor(remainder / 26) - 1;
    }
    return header;
  };

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
              return (
                <TableCell key={col} row={row} col={col}>
                  Test
                </TableCell>
              );
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
  ...props
}: TableCellProps) => {
  const { selection, selectedCell, setSelection, setSelectedCell } = useTable();

  const isInSelection = isCellInSelection(selection, row, col);
  const isSelectedCell = col === selectedCell?.col && row === selectedCell?.row;

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
    />
  );
};
