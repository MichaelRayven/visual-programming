import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import {
  useCellData,
  useCellSelection,
  useColWidth,
  useHeaderSelected,
  useRowHeight,
  useSelectedCell,
} from "@/hooks/useTableStore";
import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT, TableStore } from "@/lib/store";
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
import { useVirtualTable } from "@/hooks/useVirtualTable";

type TableProps = {
  size: {
    rows: number;
    cols: number;
  };
} & React.ComponentProps<"table">;

export const Table = ({ size, className, ...props }: TableProps) => {
  const storeRef = useRef<TableStore>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
        <div className="table-scrollable" ref={scrollContainerRef}>
          <TableContent
            containerRef={scrollContainerRef}
            className={className}
            {...props}
          />
        </div>
      </div>
    </TableStoreContext.Provider>
  );
};

type TableContentProps = {
  containerRef: React.RefObject<HTMLDivElement>;
} & React.ComponentProps<"table">;

const TableContent = ({
  containerRef,
  className,
  ...props
}: TableContentProps) => {
  const {
    startRow,
    endRow,
    startCol,
    endCol,
    totalHeight,
    totalWidth,
    rowOffsets,
    colOffsets,
  } = useVirtualTable(containerRef, 50);

  return (
    <div
      style={{
        height: `${totalHeight}px`,
        width: `${totalWidth}px`,
        position: "relative",
      }}
    >
      <table
        className={clsx("table", className)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          tableLayout: "fixed", // Critical for column widths to behave
          borderCollapse: "collapse",
        }}
        {...props}
      >
        <thead style={{ position: "sticky", top: 0, zIndex: 1020 }}>
          <TableRow row={-1}>
            <TableHead />
            <TableHeader
              start={startCol}
              end={endCol}
              colOffsets={colOffsets}
            />
          </TableRow>
        </thead>
        <tbody>
          {/* Only render rows in the virtual window */}
          {Array.from({ length: endRow - startRow + 1 }).map((_, i) => {
            const rowIdx = startRow + i;
            return (
              <TableRow
                key={rowIdx}
                row={rowIdx}
                style={{
                  position: "absolute",
                  top: 0,
                  transform: `translateY(${rowOffsets[rowIdx]}px)`,
                  width: "100%",
                  display: "flex", // Helps with cell alignment in absolute rows
                }}
              >
                <TableHead row={rowIdx}>{rowIdx + 1}</TableHead>
                <TableCellsRow
                  rowIdx={rowIdx}
                  startCol={startCol}
                  endCol={endCol}
                  colOffsets={colOffsets}
                />
              </TableRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

type TableHeaderProps = {
  start: number;
  end: number;
  colOffsets: Float64Array;
};

const TableHeader = ({ start, end, colOffsets }: TableHeaderProps) => {
  const cols = [];
  for (let i = start; i <= end; i++) {
    cols.push(
      <TableHead
        key={i}
        col={i}
        style={{
          position: "absolute",
          left: colOffsets[i],
          width: colOffsets[i + 1] - colOffsets[i],
        }}
      >
        {getColumnHeader(i)}
      </TableHead>
    );
  }
  return <>{cols}</>;
};

type TableCellsRowProps = {
  rowIdx: number;
  startCol: number;
  endCol: number;
  colOffsets: Float64Array;
};

const TableCellsRow = ({
  rowIdx,
  startCol,
  endCol,
  colOffsets,
}: TableCellsRowProps) => {
  const cells = [];
  for (let i = startCol; i <= endCol; i++) {
    cells.push(
      <TableCell
        key={i}
        row={rowIdx}
        col={i}
        style={{
          position: "absolute",
          left: colOffsets[i],
          width: colOffsets[i + 1] - colOffsets[i],
          height: "100%",
        }}
      />
    );
  }
  return <>{cells}</>;
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
          DEFAULT_COL_WIDTH,
          startWidth + (moveEvent.clientX - startX)
        );
        store.setColWidth(col, newWidth);
      } else if (isRow) {
        const newHeight = Math.max(
          DEFAULT_ROW_HEIGHT,
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
