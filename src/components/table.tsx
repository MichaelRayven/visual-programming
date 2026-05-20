import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import {
  useCellData,
  useCellSelection,
  useGridSize,
  useHeaderSelected,
  useRowHeight,
  useSelectedCell,
} from "@/hooks/useTableStore";
import { getCellAddress, getColumnHeader } from "@/lib/table";
import {
  MIN_COL_WIDTH,
  MIN_ROW_HEIGHT,
  type TableSnapshot,
} from "@/store/tableSlice";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";
import { Input } from "./input";
import "@/components/table.css";
import { useTableStore } from "@/hooks/useTableStore";
import { useVirtualTable } from "@/hooks/useVirtualTable";

type TableProps = {
  snapshot: TableSnapshot;
} & React.ComponentProps<"div">;

export const Table = ({ snapshot, className, ...props }: TableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
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
  );
};

type TableContentProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
} & React.ComponentProps<"div">;

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
    colWidths,
    rowHeights,
  } = useVirtualTable(containerRef, 50);

  return (
    <div
      className={clsx("table", className)}
      style={{
        height: `${totalHeight + MIN_ROW_HEIGHT}px`,
        width: `${totalWidth + MIN_COL_WIDTH}px`,
        position: "relative",
      }}
      {...props}
    >
      <div
        className="table-header corner"
        style={{
          width: `${MIN_COL_WIDTH}px`,
          height: `${MIN_ROW_HEIGHT}px`,
        }}
      />

      <div className="col-headers-sticky-wrapper">
        {Array.from({ length: endCol - startCol + 1 }).map((_, i) => {
          const colIdx = startCol + i;
          return (
            <TableHead
              key={`col-${colIdx}`}
              col={colIdx}
              style={{
                position: "absolute",
                left: `${MIN_COL_WIDTH + colOffsets[colIdx]}px`,
                top: 0,
                width: `${colWidths[colIdx]}px`,
                height: `${MIN_ROW_HEIGHT}px`,
              }}
            >
              {getColumnHeader(colIdx)}
            </TableHead>
          );
        })}
      </div>

      <div className="row-headers-sticky-wrapper">
        {Array.from({ length: endRow - startRow + 1 }).map((_, i) => {
          const rowIdx = startRow + i;
          return (
            <TableHead
              key={`row-header-${rowIdx}`}
              row={rowIdx}
              style={{
                position: "absolute",
                top: `${MIN_ROW_HEIGHT + rowOffsets[rowIdx]}px`,
                left: 0,
                width: `${MIN_COL_WIDTH}px`,
                height: `${rowHeights[rowIdx]}px`,
              }}
            >
              {rowIdx + 1}
            </TableHead>
          );
        })}
      </div>

      {Array.from({ length: endRow - startRow + 1 }).map((_, i) => {
        const rowIdx = startRow + i;
        return (
          <TableRow
            key={`row-${rowIdx}`}
            row={rowIdx}
            className="data-row"
            style={{
              position: "absolute",
              top: `${MIN_ROW_HEIGHT + rowOffsets[rowIdx]}px`,
              left: 0,
              width: "100%",
              height: `${rowHeights[rowIdx]}px`,
            }}
          >
            {Array.from({ length: endCol - startCol + 1 }).map((_, j) => {
              const colIdx = startCol + j;
              return (
                <TableCell
                  key={`cell-${rowIdx}-${colIdx}`}
                  row={rowIdx}
                  col={colIdx}
                  style={{
                    position: "absolute",
                    left: `${MIN_COL_WIDTH + colOffsets[colIdx]}px`,
                    width: `${colWidths[colIdx]}px`,
                    height: `${rowHeights[rowIdx]}px`,
                  }}
                />
              );
            })}
          </TableRow>
        );
      })}
    </div>
  );
};

type TableRowProps = {
  row: number;
} & React.ComponentProps<"div">;

export const TableRow = ({
  row,
  className,
  style,
  ...props
}: TableRowProps) => {
  const height = useRowHeight(row);

  return (
    <div
      className={clsx("table-row", className)}
      style={{ ...style, height }}
      {...props}
    />
  );
};

type TableHeadProps = {
  col?: number;
  row?: number;
} & React.ComponentProps<"div">;

export const TableHead = ({
  className,
  col,
  row,
  children,
  style,
  ...props
}: TableHeadProps) => {
  const store = useTableStore();
  const ref = useRef<HTMLDivElement>(null);
  const isCol = col !== undefined;
  const isRow = row !== undefined;

  const isSelected = useHeaderSelected(col, row);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!ref.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = ref.current.offsetWidth;
    const startHeight = ref.current.offsetHeight;

    const tableEl = ref.current.closest(".table") as HTMLDivElement;
    if (!tableEl) return;

    const rect = ref.current.getBoundingClientRect();
    const tableRect = tableEl.getBoundingClientRect();

    const initialLeft = rect.right - tableRect.left;
    const initialTop = rect.bottom - tableRect.top;

    const previewLine = document.createElement("div");
    if (isCol) {
      previewLine.className = "table-resize-preview-col";
      previewLine.style.left = `${initialLeft}px`;
      tableEl.appendChild(previewLine);
    } else if (isRow) {
      previewLine.className = "table-resize-preview-row";
      previewLine.style.top = `${initialTop}px`;
      tableEl.appendChild(previewLine);
    }

    let finalWidth = startWidth;
    let finalHeight = startHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isCol) {
        const deltaX = moveEvent.clientX - startX;
        finalWidth = Math.max(MIN_COL_WIDTH, startWidth + deltaX);
        const currentLeft = rect.left - tableRect.left + finalWidth;
        previewLine.style.left = `${currentLeft}px`;
      } else if (isRow) {
        const deltaY = moveEvent.clientY - startY;
        finalHeight = Math.max(MIN_ROW_HEIGHT, startHeight + deltaY);
        const currentTop = rect.top - tableRect.top + finalHeight;
        previewLine.style.top = `${currentTop}px`;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      previewLine.remove();

      if (isCol) {
        store.setColWidth(col, finalWidth);
      } else if (isRow) {
        store.setRowHeight(row, finalHeight);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={ref}
      className={clsx(
        "table-header",
        { "header-selected": isSelected },
        className
      )}
      style={style}
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
    </div>
  );
};

type TableCellProps = {
  row: number;
  col: number;
} & React.ComponentProps<"div">;

export const TableCell = React.memo(
  ({
    className,
    row,
    col,
    onClick,
    onDoubleClick,
    style,
    ...props
  }: TableCellProps) => {
    const store = useTableStore();
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
    const gridSize = useGridSize();
    const activeCell = useSelectedCell();

    const [value, setValue] = useState(
      isFocused ? rawValue : String(displayValue)
    );
    useEffect(() => {
      setValue(isFocused ? rawValue : String(displayValue));
    }, [isFocused, rawValue, displayValue]);

    useEffect(() => {
      if (!isSelected) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          internalInputRef.current?.focus();
        } else if (e.key === "Tab") {
          e.preventDefault();
          internalInputRef.current?.blur();
          if (col + 1 < gridSize.cols) {
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
    }, [isSelected, row, col, gridSize, store]);

    return (
      <div
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
        style={style}
        onDoubleClick={(e) => {
          internalInputRef.current?.focus();
          onDoubleClick?.(e);
        }}
        onClick={(e) => {
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
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            store.updateCell(row, col, value);
          }}
        />
      </div>
    );
  }
);

export function TableTopBar() {
  const store = useTableStore();
  const selectedCell = useSelectedCell();
  const cellAddress = getCellAddress(selectedCell.row, selectedCell.col);
  const { rawValue } = useCellData(selectedCell.row, selectedCell.col);

  return (
    <div className="table-top-bar">
      <div className="table-top-bar-address">{cellAddress}</div>
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
