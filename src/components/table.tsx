import clsx from "clsx";
import "./table.css";
import { useState } from "react";
import {
  getSelectionBounds,
  isCellInSelection,
  isColumnHeaderInSelection,
  isRowHeaderInSelection,
  type Selection,
} from "@/lib/table";

type SelectedCell = {
  col: number;
  row: number;
};

type TableProps = {
  size: {
    rows: number;
    cols: number;
  };
} & React.ComponentProps<"table">;

export const Table = ({ size, className, ...props }: TableProps) => {
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);

  const getColumnHeader = (idx: number) => {
    let remainder = idx;
    let header = "";
    while (remainder >= 0) {
      header = String.fromCharCode(65 + (remainder % 26)) + header;
      remainder = Math.floor(remainder / 26) - 1;
    }
    return header;
  };

  const bounds = selection && getSelectionBounds(selection);

  return (
    <table className={clsx("table", className)} {...props}>
      {/* A-Z column headers */}
      <TableRow>
        <TableHeader />
        {Array.from({ length: size.cols }).map((_, col) => (
          <TableHeader
            key={col}
            className={clsx({
              "header-selected":
                selection && isColumnHeaderInSelection(selection, col),
            })}
          >
            {getColumnHeader(col)}
          </TableHeader>
        ))}
      </TableRow>
      {Array.from({ length: size.rows }).map((_, row) => (
        <TableRow key={row}>
          <TableHeader
            className={clsx({
              "header-selected":
                selection && isRowHeaderInSelection(selection, row),
            })}
          >
            {row + 1}
          </TableHeader>
          {Array.from({ length: size.cols }).map((_, col) => {
            const isInSelection =
              selection && isCellInSelection(selection, row, col);
            const isSelectedCell =
              col === selectedCell?.col && row === selectedCell?.row;
            return (
              <TableCell
                key={col}
                className={clsx({
                  selected: isSelectedCell,
                  selection: isInSelection,
                  "selection-row-start": bounds && row === bounds.minRow,
                  "selection-row-end": bounds && row === bounds.maxRow,
                  "selection-col-start": bounds && col === bounds.minCol,
                  "selection-col-end": bounds && col === bounds.maxCol,
                })}
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
                }}
              >
                Test
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </table>
  );
};

type TableRowProps = {} & React.ComponentProps<"tr">;

export const TableRow = ({ className, ...props }: TableRowProps) => {
  return <tr className={clsx("table-row", className)} {...props} />;
};

type TableHeaderProps = {} & React.ComponentProps<"th">;

export const TableHeader = ({ className, ...props }: TableHeaderProps) => {
  return <th className={clsx("table-header", className)} {...props} />;
};

type TableCellProps = {} & React.ComponentProps<"td">;

export const TableCell = ({ className, ...props }: TableCellProps) => {
  return <td className={clsx("table-cell", className)} {...props} />;
};
