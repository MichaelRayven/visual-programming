import clsx from "clsx";
import "./table.css";
import { useState } from "react";

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
    <table className={clsx("table", className)} {...props}>
      {/* A-Z column headers */}
      <TableRow>
        <TableHeader />
        {Array.from({ length: size.cols }).map((_, col) => (
          <TableHeader key={col} selected={col === selectedCell?.col}>
            {getColumnHeader(col)}
          </TableHeader>
        ))}
      </TableRow>
      {Array.from({ length: size.rows }).map((_, row) => (
        <TableRow key={row}>
          <TableHeader selected={row === selectedCell?.row}>
            {row + 1}
          </TableHeader>
          {Array.from({ length: size.cols }).map((_, col) => (
            <TableCell
              key={col}
              selected={col === selectedCell?.col && row === selectedCell?.row}
              onClick={() => {
                setSelectedCell({ row, col });
              }}
            >
              Test
            </TableCell>
          ))}
        </TableRow>
      ))}
    </table>
  );
};

type TableRowProps = {} & React.ComponentProps<"tr">;

export const TableRow = ({ className, ...props }: TableRowProps) => {
  return <tr className={clsx("table-row", className)} {...props} />;
};

type TableHeaderProps = { selected?: boolean } & React.ComponentProps<"th">;

export const TableHeader = ({
  className,
  selected = false,
  ...props
}: TableHeaderProps) => {
  return (
    <th
      className={clsx("table-header", selected && "selected", className)}
      {...props}
    />
  );
};

type TableCellProps = { selected?: boolean } & React.ComponentProps<"td">;

export const TableCell = ({
  className,
  selected = false,
  ...props
}: TableCellProps) => {
  return (
    <td
      className={clsx("table-cell", selected && "selected", className)}
      {...props}
    />
  );
};
