import type { GridSnapshot } from "@/store/tableSlice";

import { type CellData, getCellAddress, parseCellAddress } from "./table";

/**
 * Retrieve cell value coerced to a number
 */
function getCellValueAsNumber(
  cellAddress: string,
  snapshot: GridSnapshot,
  visited: Set<string>
): number {
  const res = evaluateCell(cellAddress, snapshot, visited);
  const val = res.value;
  if (typeof val === "number") return val;
  if (typeof val === "boolean") return val ? 1 : 0;
  const parsed = Number(val);
  return parsed;
}

/**
 * Get array of cell IDs inside a range (e.g., "A1:B3")
 */
function resolveRange(start: string, end: string): string[] {
  const startCoords = parseCellAddress(start);
  const endCoords = parseCellAddress(end);
  if (!startCoords || !endCoords) return [];

  const minRow = Math.min(startCoords.row, endCoords.row);
  const maxRow = Math.max(startCoords.row, endCoords.row);
  const minCol = Math.min(startCoords.col, endCoords.col);
  const maxCol = Math.max(startCoords.col, endCoords.col);

  const cells: string[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      cells.push(getCellAddress(r, c));
    }
  }
  return cells;
}

export function evaluateCell(
  cellAddress: string,
  snapshot: GridSnapshot,
  visited = new Set<string>()
): CellData {
  const pos = parseCellAddress(cellAddress);
  if (!pos) return { value: "", rawValue: "", type: "string" };

  const rowId = snapshot.rowIds[pos.row];
  const colId = snapshot.colIds[pos.col];

  const raw = (rowId && colId && snapshot.cells[`${rowId}_${colId}`]) || "";

  if (raw === "") return { value: "", rawValue: raw, type: "string" };
  if (visited.has(cellAddress))
    return { value: "#REF!", rawValue: raw, type: "formula" };

  visited.add(cellAddress);

  if (raw.startsWith("=")) {
    try {
      const formula = raw.slice(1).toUpperCase().trim();
      const result = evaluateFormula(formula, snapshot, visited);
      visited.delete(cellAddress);
      return { value: result, rawValue: raw, type: "formula" };
    } catch {
      visited.delete(cellAddress);
      return { value: "#VALUE!", rawValue: raw, type: "formula" };
    }
  }

  visited.delete(cellAddress);

  if (raw.toLowerCase() === "true") {
    return { value: true, rawValue: raw, type: "boolean" };
  }
  if (raw.toLowerCase() === "false") {
    return { value: false, rawValue: raw, type: "boolean" };
  }

  const num = Number(raw);
  if (!isNaN(num) && raw.trim() !== "") {
    return { value: num, rawValue: raw, type: "number" };
  }

  return { value: raw, rawValue: raw, type: "string" };
}

function evaluateFormula(
  formula: string,
  snapshot: GridSnapshot,
  visited: Set<string>
): string | number | boolean {
  // Plain reference (A1, B10)
  const referenceMatch = formula.match(/^([A-Z]+[0-9]+)$/);
  if (referenceMatch) {
    return evaluateCell(referenceMatch[1], snapshot, visited).value;
  }

  // SUM(A1:A5)
  const sumMatch = formula.match(/^SUM\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/);
  if (sumMatch) {
    const cells = resolveRange(sumMatch[1], sumMatch[2]);
    const sum = cells.reduce(
      (sum, cell) => sum + getCellValueAsNumber(cell, snapshot, visited),
      0
    );
    return isNaN(sum) ? "#NAN!" : sum;
  }

  // AVERAGE(B1:B3)
  const avgMatch = formula.match(/^AVERAGE\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/);
  if (avgMatch) {
    const cells = resolveRange(avgMatch[1], avgMatch[2]);
    if (cells.length === 0) return 0;
    const sum = cells.reduce(
      (sum, cell) => sum + getCellValueAsNumber(cell, snapshot, visited),
      0
    );
    return isNaN(sum) ? "#NAN!" : sum / cells.length;
  }

  // Arithmetic operations (A1+B1, A1-B1, A1*B1, A1/B1)
  const arithmeticMatch = formula.match(
    /^([A-Z]+[0-9]+|\d+(?:\.\d+)?)\s*([+\-*/])\s*([A-Z]+[0-9]+|\d+(?:\.\d+)?)$/
  );
  if (arithmeticMatch) {
    const leftToken = arithmeticMatch[1];
    const op = arithmeticMatch[2];
    const rightToken = arithmeticMatch[3];

    const leftVal = parseCellAddress(leftToken)
      ? getCellValueAsNumber(leftToken, snapshot, visited)
      : Number(leftToken);

    const rightVal = parseCellAddress(rightToken)
      ? getCellValueAsNumber(rightToken, snapshot, visited)
      : Number(rightToken);

    if (isNaN(leftVal) || isNaN(rightVal)) {
      return "#NAN!";
    }

    switch (op) {
      case "+":
        return leftVal + rightVal;
      case "-":
        return leftVal - rightVal;
      case "*":
        return leftVal * rightVal;
      case "/":
        return rightVal === 0 ? "#DIV/0!" : leftVal / rightVal;
      default:
        return "#VALUE!";
    }
  }

  return "#NAME?";
}
