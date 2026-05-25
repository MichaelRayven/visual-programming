import clsx from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { shallowEqual } from "react-redux";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import {
  useCellData,
  useCellSelection,
  useHeaderSelected,
  useSelectedCell,
} from "@/hooks/useTableStore";
import { getCellAddress, getColumnHeader } from "@/lib/table";
import {
  MIN_COL_WIDTH,
  MIN_ROW_HEIGHT,
  spreadsheetActions,
  type TableSnapshot,
} from "@/store/spreadsheetSlice";
import "./table.css";
import { TableToolbar } from "@/components/toolbar";
import { useTableStore } from "@/hooks/useTableStore";
import { useVirtualTable } from "@/hooks/useVirtualTable";
import { store as reduxStore, useAppDispatch, useAppSelector } from "@/store";

// Registry for cell textarea refs, keyed by "row_col"
const cellInputRegistry = new Map<string, HTMLTextAreaElement>();

type TableProps = {
  snapshot: TableSnapshot;
} & React.ComponentProps<"div">;

export const Table = ({ snapshot, className, ...props }: TableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useTableKeyboard();

  return (
    <div className="table-wrapper">
      <TableToolbar />
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

/**
 * Single table-level keyboard handler that replaces per-cell keydown listeners.
 * Reads current cell position from the store on-demand via store.getState().
 */
function useTableKeyboard() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const state = reduxStore.getState().spreadsheet;
      const { row, col } = state.selectedCell;
      const gridSize = state.gridSize;

      const cellKey = `${row}_${col}`;
      const activeInput = cellInputRegistry.get(cellKey);
      const isEditingCell = target === activeInput;

      // If focusing other inputs (e.g. formula bar, toolbar), don't trigger cell hotkeys
      if (
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT") &&
        !isEditingCell &&
        !target.classList.contains("table-top-bar-input")
      ) {
        return;
      }

      if (isEditingCell) {
        if (e.key === "Enter") {
          if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            activeInput?.blur();
            if (row + 1 < gridSize.rows) {
              dispatch(
                spreadsheetActions.setSelectedCell({ row: row + 1, col })
              );
              dispatch(
                spreadsheetActions.setSelection({
                  rowStart: row + 1,
                  colStart: col,
                  rowEnd: row + 1,
                  colEnd: col,
                })
              );
            }
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          activeInput?.blur();
        } else if (e.key === "Tab") {
          e.preventDefault();
          activeInput?.blur();
          if (e.shiftKey) {
            if (col > 0) {
              dispatch(
                spreadsheetActions.setSelectedCell({ row, col: col - 1 })
              );
              dispatch(
                spreadsheetActions.setSelection({
                  rowStart: row,
                  colStart: col - 1,
                  rowEnd: row,
                  colEnd: col - 1,
                })
              );
            }
          } else {
            if (col + 1 < gridSize.cols) {
              dispatch(
                spreadsheetActions.setSelectedCell({ row, col: col + 1 })
              );
              dispatch(
                spreadsheetActions.setSelection({
                  rowStart: row,
                  colStart: col + 1,
                  rowEnd: row,
                  colEnd: col + 1,
                })
              );
            }
          }
        }
      } else {
        if (e.key === "Enter") {
          e.preventDefault();
          activeInput?.focus();
        } else if (e.key === "Tab") {
          e.preventDefault();
          if (e.shiftKey) {
            if (col > 0) {
              dispatch(
                spreadsheetActions.setSelectedCell({ row, col: col - 1 })
              );
              dispatch(
                spreadsheetActions.setSelection({
                  rowStart: row,
                  colStart: col - 1,
                  rowEnd: row,
                  colEnd: col - 1,
                })
              );
            }
          } else {
            if (col + 1 < gridSize.cols) {
              dispatch(
                spreadsheetActions.setSelectedCell({ row, col: col + 1 })
              );
              dispatch(
                spreadsheetActions.setSelection({
                  rowStart: row,
                  colStart: col + 1,
                  rowEnd: row,
                  colEnd: col + 1,
                })
              );
            }
          }
        } else if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          dispatch(spreadsheetActions.clearSelectedCells());
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (row > 0) {
            dispatch(spreadsheetActions.setSelectedCell({ row: row - 1, col }));
            dispatch(
              spreadsheetActions.setSelection({
                rowStart: row - 1,
                colStart: col,
                rowEnd: row - 1,
                colEnd: col,
              })
            );
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (row + 1 < gridSize.rows) {
            dispatch(spreadsheetActions.setSelectedCell({ row: row + 1, col }));
            dispatch(
              spreadsheetActions.setSelection({
                rowStart: row + 1,
                colStart: col,
                rowEnd: row + 1,
                colEnd: col,
              })
            );
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          if (col > 0) {
            dispatch(spreadsheetActions.setSelectedCell({ row, col: col - 1 }));
            dispatch(
              spreadsheetActions.setSelection({
                rowStart: row,
                colStart: col - 1,
                rowEnd: row,
                colEnd: col - 1,
              })
            );
          }
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          if (col + 1 < gridSize.cols) {
            dispatch(spreadsheetActions.setSelectedCell({ row, col: col + 1 }));
            dispatch(
              spreadsheetActions.setSelection({
                rowStart: row,
                colStart: col + 1,
                rowEnd: row,
                colEnd: col + 1,
              })
            );
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);
}

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
      className={clsx("table table-absolute", className)}
      style={
        {
          "--table-height": `${totalHeight + MIN_ROW_HEIGHT}px`,
          "--table-width": `${totalWidth + MIN_COL_WIDTH}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      <div className="table-header corner" />

      <div className="col-headers-sticky-wrapper">
        {Array.from({ length: endCol - startCol + 1 }).map((_, i) => {
          const colIdx = startCol + i;
          return (
            <TableHead
              key={`col-${colIdx}`}
              col={colIdx}
              className="col-header-absolute"
              style={
                {
                  "--col-left": `${MIN_COL_WIDTH + colOffsets[colIdx]}px`,
                  "--col-width": `${colWidths[colIdx]}px`,
                } as React.CSSProperties
              }
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
              className="row-header-absolute"
              style={
                {
                  "--row-top": `${MIN_ROW_HEIGHT + rowOffsets[rowIdx]}px`,
                  "--row-height": `${rowHeights[rowIdx]}px`,
                } as React.CSSProperties
              }
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
            className="data-row row-absolute"
            style={
              {
                "--row-top": `${MIN_ROW_HEIGHT + rowOffsets[rowIdx]}px`,
                "--row-height": `${rowHeights[rowIdx]}px`,
              } as React.CSSProperties
            }
          >
            {Array.from({ length: endCol - startCol + 1 }).map((_, j) => {
              const colIdx = startCol + j;
              return (
                <TableCell
                  key={`cell-${rowIdx}-${colIdx}`}
                  row={rowIdx}
                  col={colIdx}
                  className="cell-absolute"
                  style={
                    {
                      "--cell-left": `${MIN_COL_WIDTH + colOffsets[colIdx]}px`,
                      "--cell-width": `${colWidths[colIdx]}px`,
                      "--cell-height": `${rowHeights[rowIdx]}px`,
                    } as React.CSSProperties
                  }
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
  return (
    <div
      className={clsx(
        "table-row",
        row % 2 === 0 ? "row-even" : "row-odd",
        className
      )}
      style={style}
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
      {isCol && <div className="col-resizer" onMouseDown={handleMouseDown} />}
      {isRow && <div className="row-resizer" onMouseDown={handleMouseDown} />}
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
    const internalInputRef = useRef<HTMLTextAreaElement>(null);

    const { rawValue, displayValue } = useCellData(row, col);
    const {
      isSelected,
      isInSelection,
      isRowStart,
      isRowEnd,
      isColStart,
      isColEnd,
    } = useCellSelection(row, col);

    const cellStyles = useAppSelector((state) => {
      const rowId = state.spreadsheet.gridSnapshot.rowIds[row];
      const colId = state.spreadsheet.gridSnapshot.colIds[col];
      if (!rowId || !colId) return undefined;
      return state.spreadsheet.gridSnapshot.cellStyles?.[`${rowId}_${colId}`];
    }, shallowEqual);

    const [value, setValue] = useState(
      isFocused ? rawValue : String(displayValue)
    );
    useEffect(() => {
      setValue(isFocused ? rawValue : String(displayValue));
    }, [isFocused, rawValue, displayValue]);

    useEffect(() => {
      const key = `${row}_${col}`;
      const el = internalInputRef.current;
      if (el) {
        cellInputRegistry.set(key, el);
      }
      return () => {
        cellInputRegistry.delete(key);
      };
    }, [row, col]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setValue(rawValue);
          setIsFocused(false);
          internalInputRef.current?.blur();
        }
      },
      [rawValue]
    );

    const cellCustomStyles: React.CSSProperties = {
      ...style,
      fontWeight: cellStyles?.bold ? "bold" : "normal",
      fontStyle: cellStyles?.italic ? "italic" : "normal",
      textDecoration: cellStyles?.underline ? "underline" : "none",
      backgroundColor: cellStyles?.bgColor || undefined,
      color: cellStyles?.textColor || undefined,
    };

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
        style={cellCustomStyles}
        onDoubleClick={(e) => {
          internalInputRef.current?.focus();
          onDoubleClick?.(e);
        }}
        onClick={(e) => {
          if (e.shiftKey) {
            const activeCell = reduxStore.getState().spreadsheet.selectedCell;
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
        <textarea
          ref={internalInputRef}
          className="table-cell-input"
          style={{
            textAlign: cellStyles?.align || "left",
            fontWeight: cellStyles?.bold ? "bold" : "normal",
            fontStyle: cellStyles?.italic ? "italic" : "normal",
            textDecoration: cellStyles?.underline ? "underline" : "none",
            color: cellStyles?.textColor || undefined,
          }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            store.updateCell(row, col, value);
          }}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    const prevStyle = prevProps.style as Record<
      string,
      string | number | undefined
    >;
    const nextStyle = nextProps.style as Record<
      string,
      string | number | undefined
    >;
    return (
      prevProps.row === nextProps.row &&
      prevProps.col === nextProps.col &&
      prevProps.className === nextProps.className &&
      prevStyle?.["--cell-left"] === nextStyle?.["--cell-left"] &&
      prevStyle?.["--cell-width"] === nextStyle?.["--cell-width"] &&
      prevStyle?.["--cell-height"] === nextStyle?.["--cell-height"]
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
