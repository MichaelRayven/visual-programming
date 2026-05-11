import clsx from "clsx";
import { TableContextProvider, useTable } from "@/hooks/useTable";
import {
  getCellAddress,
  getColumnHeader,
  isCellInSelection,
  isColumnHeaderInSelection,
  isRowHeaderInSelection,
} from "@/lib/table";
import "@/components/table.css";
import { useEffect, useRef, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";
import { Input } from "./input";

const MIN_COLUMN_WIDTH = 64;
const MIN_ROW_HEIGHT = 32;

type TableProps = React.ComponentProps<"table">;

export const Table = (props: TableProps) => {
  return (
    <TableContextProvider>
      <TableContent {...props} />
    </TableContextProvider>
  );
};

const TableContent = ({ className, ...props }: TableProps) => {
  const selectedInputRef = useRef<HTMLInputElement>(null);
  const {
    selectedCell,
    setSelectedCell,
    setSelection,
    rowIds,
    colIds,
    colWidths,
    rowHeights,
    handleColResize,
    handleRowResize,
  } = useTable();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      if (e.key === "Enter") {
        e.preventDefault();
        selectedInputRef.current?.focus();
      } else if (e.key === "Tab") {
        e.preventDefault();
        selectedInputRef.current?.blur();

        // Logical bounds check based on current ID arrays
        if (selectedCell.col + 1 < colIds.length) {
          const newPos = { col: selectedCell.col + 1, row: selectedCell.row };
          setSelectedCell(newPos);
          setSelection({
            rowStart: newPos.row,
            colStart: newPos.col,
            rowEnd: newPos.row,
            colEnd: newPos.col,
          });
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selectedCell, colIds.length, setSelectedCell, setSelection]);

  return (
    <div className="table-wrapper">
      <TableTopBar />

      <div className="table-scrollable">
        <table className={clsx("table", className)} {...props}>
          <thead>
            <TableRow>
              <TableHeader />
              {colIds.map((id, colIdx) => (
                <TableHeader
                  key={id}
                  col={colIdx}
                  style={
                    colWidths[id]
                      ? { width: colWidths[id], minWidth: colWidths[id] }
                      : undefined
                  }
                  onResize={(width) => handleColResize(id, width)}
                >
                  {getColumnHeader(colIdx)}
                </TableHeader>
              ))}
            </TableRow>
          </thead>
          <tbody>
            {rowIds.map((rowId, rowIdx) => (
              <TableRow
                key={rowId}
                style={
                  rowHeights[rowId] ? { height: rowHeights[rowId] } : undefined
                }
              >
                <TableHeader
                  row={rowIdx}
                  onResize={(height) => handleRowResize(rowId, height)}
                >
                  {rowIdx + 1}
                </TableHeader>
                {colIds.map((_, colIdx) => {
                  const isSelectedCell =
                    colIdx === selectedCell?.col &&
                    rowIdx === selectedCell?.row;
                  return (
                    <TableCell
                      key={colIds[colIdx]} // Stable ID for cells
                      row={rowIdx}
                      col={colIdx}
                      inputRef={isSelectedCell ? selectedInputRef : undefined}
                    />
                  );
                })}
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TableRow = ({
  className,
  ...props
}: React.ComponentProps<"tr">) => {
  return <tr className={clsx("table-row", className)} {...props} />;
};

export const TableHeader = ({
  className,
  col,
  row,
  onResize,
  children,
  ...props
}: {
  col?: number;
  row?: number;
  onResize?: (size: number) => void;
} & React.ComponentProps<"th">) => {
  const { selection, insertColumn, deleteColumn, insertRow, deleteRow } =
    useTable();
  const ref = useRef<HTMLTableCellElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = ref.current?.offsetWidth || 0;
    const startHeight = ref.current?.offsetHeight || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (col !== undefined && onResize) {
        onResize(
          Math.max(MIN_COLUMN_WIDTH, startWidth + (moveEvent.clientX - startX))
        );
      } else if (row !== undefined && onResize) {
        onResize(
          Math.max(MIN_ROW_HEIGHT, startHeight + (moveEvent.clientY - startY))
        );
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const isCol = col !== undefined;
  const isRow = row !== undefined;

  return (
    <th
      ref={ref}
      className={clsx(
        "table-header",
        {
          "header-selected":
            (isCol && isColumnHeaderInSelection(selection, col)) ||
            (isRow && isRowHeaderInSelection(selection, row)),
        },
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
              <ContextMenuItem onClick={() => insertColumn(col, "left")}>
                Insert left
              </ContextMenuItem>
              <ContextMenuItem onClick={() => insertColumn(col, "right")}>
                Insert right
              </ContextMenuItem>
              <ContextMenuItem onClick={() => deleteColumn(col)}>
                Delete column
              </ContextMenuItem>
            </>
          )}
          {isRow && (
            <>
              <ContextMenuItem onClick={() => insertRow(row, "above")}>
                Insert above
              </ContextMenuItem>
              <ContextMenuItem onClick={() => insertRow(row, "below")}>
                Insert below
              </ContextMenuItem>
              <ContextMenuItem onClick={() => deleteRow(row)}>
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

export const TableCell = ({
  className,
  row,
  col,
  inputRef,
  ...props
}: {
  row: number;
  col: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
} & React.ComponentProps<"td">) => {
  const {
    selection,
    selectedCell,
    setSelection,
    setSelectedCell,
    updateCell,
    getCellData,
    rowIds,
    colIds,
  } = useTable();
  const [isFocused, setIsFocused] = useState(false);

  const cellId = `${rowIds[row]}_${colIds[col]}`;
  const { value, rawValue } = getCellData(cellId);
  const isInSelection = isCellInSelection(selection, row, col);
  const isSelectedCell = col === selectedCell?.col && row === selectedCell?.row;

  return (
    <td
      className={clsx(
        "table-cell",
        {
          selected: isSelectedCell,
          selection: isInSelection,
        },
        className
      )}
      onClick={(e) => {
        const newPos = { row, col };
        if (e.shiftKey) {
          setSelection({ ...selection, rowEnd: row, colEnd: col });
        } else {
          setSelectedCell(newPos);
          setSelection({
            rowStart: row,
            colStart: col,
            rowEnd: row,
            colEnd: col,
          });
        }
      }}
      onDoubleClick={() => inputRef?.current?.focus()}
      {...props}
    >
      <Input
        ref={inputRef}
        className="table-cell-input"
        value={isFocused ? rawValue : String(value)}
        onChange={(e) => updateCell(cellId, e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </td>
  );
};

export function TableTopBar() {
  const { selectedCell, getCellData, updateCell, rowIds, colIds } = useTable();
  const cellId = `${rowIds[selectedCell.row]}_${colIds[selectedCell.col]}`;
  const cellAddress = getCellAddress(selectedCell.row, selectedCell.col);
  const { rawValue } = getCellData(cellId);

  return (
    <div className="table-top-bar">
      <div className="table-top-bar-address">{cellAddress}</div>
      <Input
        className="table-top-bar-input"
        value={rawValue}
        onChange={(e) => updateCell(cellId, e.target.value)}
      />
    </div>
  );
}
