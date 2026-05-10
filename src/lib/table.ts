export type CellType = "string" | "number" | "boolean" | "formula";

export interface CellData {
  value: string | number | boolean;
  rawValue: string;
  type: CellType;
}

export type CellPosition = {
  col: number;
  row: number;
};

export type TableSelection = {
  colStart: number;
  rowStart: number;
  colEnd: number;
  rowEnd: number;
};

/**
 * Ensured colStart and rowStart have the minimum index,
 * while colEnd and rowEnd have maximum index */
export const getSelectionBounds = (
  selection: TableSelection
): TableSelection => {
  return {
    rowStart: Math.min(selection.rowStart, selection.rowEnd),
    rowEnd: Math.max(selection.rowStart, selection.rowEnd),
    colStart: Math.min(selection.colStart, selection.colEnd),
    colEnd: Math.max(selection.colStart, selection.colEnd),
  };
};

export const isCellInSelection = (
  selection: TableSelection | null,
  row: number,
  col: number
) => {
  if (!selection) return false;
  const { rowStart, rowEnd, colStart, colEnd } = getSelectionBounds(selection);

  return row >= rowStart && row <= rowEnd && col >= colStart && col <= colEnd;
};

export const isColumnHeaderInSelection = (
  selection: TableSelection | null,
  col: number
) => {
  if (!selection) return false;
  const { rowStart, rowEnd, colStart, colEnd } = getSelectionBounds(selection);

  return col >= colStart && col <= colEnd && rowStart <= rowEnd;
};

export const isRowHeaderInSelection = (
  selection: TableSelection | null,
  row: number
) => {
  if (!selection) return false;
  const { rowStart, rowEnd, colStart, colEnd } = getSelectionBounds(selection);

  return row >= rowStart && row <= rowEnd && colStart <= colEnd;
};

export const getColumnHeader = (idx: number) => {
  let remainder = idx;
  let header = "";
  while (remainder >= 0) {
    header = String.fromCharCode(65 + (remainder % 26)) + header;
    remainder = Math.floor(remainder / 26) - 1;
  }
  return header;
};

export const getCellId = (row: number, col: number): string => {
  return `${getColumnHeader(col)}${row + 1}`;
};

export const parseCellId = (id: string): CellPosition | null => {
  const match = id.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  const colsStr = match[1];
  const rowStr = match[2];

  let col = 0;
  for (let i = 0; i < colsStr.length; i++) {
    col = col * 26 + (colsStr.charCodeAt(i) - 64);
  }
  col -= 1;

  const row = parseInt(rowStr, 10) - 1;
  return { row, col };
};
