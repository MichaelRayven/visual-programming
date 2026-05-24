import { v4 as uuidv4 } from "uuid";
import { type Document } from "@/store/documentsSlice";
import { type TableSnapshot } from "@/store/spreadsheetSlice";
import { exportToCSV, parseCSV } from "./csv";

export const exportDocToCsv = (doc: Document): string => {
  const { gridSnapshot, gridSize } = doc.tableSnapshot;
  const data: string[][] = [];

  for (let r = 0; r < gridSize.rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < gridSize.cols; c++) {
      const cellId = `${gridSnapshot.rowIds[r]}_${gridSnapshot.colIds[c]}`;
      row.push(gridSnapshot.cells[cellId] || "");
    }
    data.push(row);
  }
  return exportToCSV(data);
};

export const exportDocToJson = (doc: Document): string => {
  const payload = {
    id: doc.id,
    title: doc.title,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    tableSnapshot: doc.tableSnapshot,
  };
  return JSON.stringify(payload, null, 2);
};

export const importDocFromCsv = (csv: string, title: string): Document => {
  const rows = parseCSV(csv);
  const numRows = Math.max(rows.length, 1);
  const numCols = Math.max(
    rows.reduce((max, r) => Math.max(max, r.length), 0),
    1
  );

  const tableSnapshot: TableSnapshot = {
    gridSnapshot: {
      cells: {},
      rowIds: Array.from({ length: numRows }, () => uuidv4()),
      colIds: Array.from({ length: numCols }, () => uuidv4()),
    },
    gridSize: { rows: numRows, cols: numCols },
    colWidths: {},
    rowHeights: {},
  };

  rows.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value !== "") {
        const cellId = `${tableSnapshot.gridSnapshot.rowIds[r]}_${tableSnapshot.gridSnapshot.colIds[c]}`;
        tableSnapshot.gridSnapshot.cells[cellId] = value;
      }
    });
  });

  return {
    id: uuidv4(),
    title: title || "Imported document",
    userId: "",
    tableSnapshot,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const downloadDocumentFile = (
  content: string,
  filename: string,
  mimeType: string
): void => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
