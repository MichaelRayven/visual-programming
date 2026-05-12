import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import {
  useCellData,
  useCellSelection,
  useColWidth,
  useGridSize,
  useHeaderSelected,
  useRowHeight,
  useSelectedCell,
} from "@/hooks/useTableStore";
import { TableStore } from "@/lib/store";
import { getCellAddress, getColumnHeader } from "@/lib/table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";
import { Input } from "./input";
import "@/components/table.css";
import { TableStoreContext, useStore } from "@/hooks/useTable";

const MIN_COLUMN_WIDTH = 64;
const MIN_ROW_HEIGHT = 32;

type TableProps = {
  size: {
    rows: number;
    cols: number;
  };
} & React.ComponentProps<"table">;

export const Table = ({ size, className, ...props }: TableProps) => {
  const storeRef = useRef<TableStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = new TableStore(size);
  }

  useEffect(() => {
    storeRef.current?.setGridSize(size);
  }, [size]);

  return (
    <TableStoreContext.Provider value={storeRef.current}>
      <div className="table-wrapper">
        <TableTopBar />
        <div className="table-scrollable">
          <table className={clsx("table", className)} {...props}>
            <thead>
              <TableRow row={-1}>
                <TableHead />
                <TableHeader />
              </TableRow>
            </thead>
            <TableBody />
          </table>
        </div>
      </div>
    </TableStoreContext.Provider>
  );
};

const TableHeader = () => {
  const { cols } = useGridSize();
  return (
    <>
      {Array.from({ length: cols }).map((_, col) => (
        <TableHead key={col} col={col}>
          {getColumnHeader(col)}
        </TableHead>
      ))}
    </>
  );
};

const TableBody = () => {
  const { rows, cols } = useGridSize();
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, row) => (
        <TableRow key={row} row={row}>
          <TableHead row={row}>{row + 1}</TableHead>
          {Array.from({ length: cols }).map((_, col) => (
            <TableCell key={col} row={row} col={col} />
          ))}
        </TableRow>
      ))}
    </tbody>
  );
};

type TableRowProps = {
  row: number;
} & React.ComponentProps<"tr">;

export const TableRow = ({
  row,
  className,
  style,
  ...props
}: TableRowProps) => {
  const height = useRowHeight(row);
  return (
    <tr
      className={clsx("table-row", className)}
      style={{ ...style, height }}
      {...props}
    />
  );
};

type TableHeadProps = {
  col?: number;
  row?: number;
} & React.ComponentProps<"th">;

export const TableHead = ({
  className,
  col,
  row,
  children,
  style,
  ...props
}: TableHeadProps) => {
  const store = useStore();
  const ref = useRef<HTMLTableCellElement>(null);
  const isCol = col !== undefined;
  const isRow = row !== undefined;

  const isSelected = useHeaderSelected(col, row);
  const width = useColWidth(col);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = ref.current?.offsetWidth || 0;
    const startHeight = ref.current?.offsetHeight || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isCol) {
        const newWidth = Math.max(
          MIN_COLUMN_WIDTH,
          startWidth + (moveEvent.clientX - startX)
        );
        store.setColWidth(col, newWidth);
      } else if (isRow) {
        const newHeight = Math.max(
          MIN_ROW_HEIGHT,
          startHeight + (moveEvent.clientY - startY)
        );
        store.setRowHeight(row, newHeight);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const resolvedStyle = {
    ...style,
    ...(isCol && width ? { width, minWidth: width } : {}),
  };

  return (
    <th
      ref={ref}
      style={resolvedStyle}
      className={clsx(
        "table-header",
        { "header-selected": isSelected },
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
              <ContextMenuItem onClick={() => store.insertColumn(col, "left")}>
                Insert column left
              </ContextMenuItem>
              <ContextMenuItem onClick={() => store.insertColumn(col, "right")}>
                Insert column right
              </ContextMenuItem>
              <ContextMenuItem onClick={() => store.deleteColumn(col)}>
                Delete column
              </ContextMenuItem>
            </>
          )}
          {isRow && (
            <>
              <ContextMenuItem onClick={() => store.insertRow(row, "above")}>
                Insert row above
              </ContextMenuItem>
              <ContextMenuItem onClick={() => store.insertRow(row, "below")}>
                Insert row below
              </ContextMenuItem>
              <ContextMenuItem onClick={() => store.deleteRow(row)}>
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
} & React.ComponentProps<"td">;

export const TableCell = React.memo(
  ({
    className,
    row,
    col,
    onClick,
    onDoubleClick,
    ...props
  }: TableCellProps) => {
    const store = useStore();
    const [isFocused, setIsFocused] = useState(false);
    const internalInputRef = useRef<HTMLInputElement>(null);

    const { rawValue, displayValue } = useCellData(row, col);
    const {
      isSelected,
      isInSelection,
      isRowStart,
      isRowEnd,
      isColStart,
      isColEnd,
    } = useCellSelection(row, col);

    const value = isFocused ? rawValue : String(displayValue);

    useEffect(() => {
      if (!isSelected) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          internalInputRef.current?.focus();
        } else if (e.key === "Tab") {
          e.preventDefault();
          internalInputRef.current?.blur();
          const grid = store.getGridSizeSnapshot();
          if (col + 1 < grid.cols) {
            store.setSelectedCell({ row, col: col + 1 });
            store.setSelection({
              rowStart: row,
              colStart: col + 1,
              rowEnd: row,
              colEnd: col + 1,
            });
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isSelected, row, col, store]);

    return (
      <td
        className={clsx(
          "table-cell",
          {
            selected: isSelected,
            selection: isInSelection,
            "selection-row-start": isRowStart,
            "selection-row-end": isRowEnd,
            "selection-col-start": isColStart,
            "selection-col-end": isColEnd,
          },
          className
        )}
        onDoubleClick={(e) => {
          internalInputRef.current?.focus();
          onDoubleClick?.(e);
        }}
        onClick={(e) => {
          const activeCell = store.getSelectedCellSnapshot();
          if (e.shiftKey) {
            store.setSelection({
              rowStart: activeCell.row,
              colStart: activeCell.col,
              rowEnd: row,
              colEnd: col,
            });
          } else {
            store.setSelectedCell({ row, col });
            store.setSelection({
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
          ref={internalInputRef}
          className="table-cell-input"
          value={value}
          onChange={(e) => store.updateCell(row, col, e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </td>
    );
  }
);

TableCell.displayName = "TableCell";

export function TableTopBar() {
  const store = useStore();
  const selectedCell = useSelectedCell();
  const cellAddr = getCellAddress(selectedCell.row, selectedCell.col);
  const { rawValue } = useCellData(selectedCell.row, selectedCell.col);

  return (
    <div className="table-top-bar">
      <div className="table-top-bar-address">{cellAddr}</div>
      <Input
        className="table-top-bar-input"
        value={rawValue}
        onChange={(e) =>
          store.updateCell(selectedCell.row, selectedCell.col, e.target.value)
        }
      />
    </div>
  );
}
