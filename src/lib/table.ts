export type SelectedCell = {
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
