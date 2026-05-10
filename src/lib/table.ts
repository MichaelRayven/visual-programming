export type Selection = {
  colStart: number;
  rowStart: number;
  colEnd: number;
  rowEnd: number;
};

export const getSelectionBounds = (selection: Selection) => {
  return {
    minRow: Math.min(selection.rowStart, selection.rowEnd),
    maxRow: Math.max(selection.rowStart, selection.rowEnd),
    minCol: Math.min(selection.colStart, selection.colEnd),
    maxCol: Math.max(selection.colStart, selection.colEnd),
  };
};

export const isCellInSelection = (
  selection: Selection,
  row: number,
  col: number
) => {
  const { minRow, maxRow, minCol, maxCol } = getSelectionBounds(selection);

  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
};

export const isColumnHeaderInSelection = (
  selection: Selection,
  col: number
) => {
  const { minRow, maxRow, minCol, maxCol } = getSelectionBounds(selection);

  return col >= minCol && col <= maxCol && minRow <= maxRow;
};

export const isRowHeaderInSelection = (selection: Selection, row: number) => {
  const { minRow, maxRow, minCol, maxCol } = getSelectionBounds(selection);

  return row >= minRow && row <= maxRow && minCol <= maxCol;
};
