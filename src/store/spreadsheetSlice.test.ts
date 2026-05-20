import { describe, expect, it } from "vitest";
import spreadsheetReducer, {
  MIN_COL_WIDTH,
  MIN_ROW_HEIGHT,
  type SpreadsheetState,
  spreadsheetActions,
} from "./spreadsheetSlice";

describe("spreadsheetSlice reducer", () => {
  const getInitialState = (): SpreadsheetState => ({
    gridSnapshot: {
      cells: {},
      rowIds: ["row-1", "row-2"],
      colIds: ["col-1", "col-2"],
    },
    colWidths: {},
    rowHeights: {},
    gridSize: { rows: 2, cols: 2 },
    selectedCell: { row: 0, col: 0 },
    selection: { rowStart: 0, rowEnd: 0, colStart: 0, colEnd: 0 },
    past: [],
    future: [],
  });

  it("should initialize the table properly with initTable", () => {
    const initialState = getInitialState();
    const snapshot = {
      gridSnapshot: {
        cells: { "row-1_col-1": "Hello" },
        rowIds: ["row-1"],
        colIds: ["col-1"],
      },
      gridSize: { rows: 1, cols: 1 },
      colWidths: { "col-1": 150 },
      rowHeights: { "row-1": 40 },
    };

    const nextState = spreadsheetReducer(
      initialState,
      spreadsheetActions.initTable(snapshot)
    );

    expect(nextState.gridSize).toEqual({ rows: 1, cols: 1 });
    expect(nextState.gridSnapshot.cells["row-1_col-1"]).toBe("Hello");
    expect(nextState.colWidths["col-1"]).toBe(150);
    expect(nextState.rowHeights["row-1"]).toBe(40);
    expect(nextState.past).toEqual([]);
    expect(nextState.future).toEqual([]);
  });

  it("should handle updateCell and push to history only if value changed", () => {
    const initialState = getInitialState();

    // 1. Update cell with a new value
    const state1 = spreadsheetReducer(
      initialState,
      spreadsheetActions.updateCell({ row: 0, col: 0, value: "Value 1" })
    );
    expect(state1.gridSnapshot.cells["row-1_col-1"]).toBe("Value 1");
    expect(state1.past.length).toBe(1);
    expect(state1.past[0].gridSnapshot.cells["row-1_col-1"]).toBeUndefined();

    // 2. Update cell with the same value (should NOT push to history)
    const state2 = spreadsheetReducer(
      state1,
      spreadsheetActions.updateCell({ row: 0, col: 0, value: "Value 1" })
    );
    expect(state2.past.length).toBe(1);

    // 3. Update cell with a different value
    const state3 = spreadsheetReducer(
      state2,
      spreadsheetActions.updateCell({ row: 0, col: 0, value: "Value 2" })
    );
    expect(state3.gridSnapshot.cells["row-1_col-1"]).toBe("Value 2");
    expect(state3.past.length).toBe(2);
    expect(state3.past[1].gridSnapshot.cells["row-1_col-1"]).toBe("Value 1");
  });

  it("should handle setSelectedCell and setSelection", () => {
    const initialState = getInitialState();

    const state1 = spreadsheetReducer(
      initialState,
      spreadsheetActions.setSelectedCell({ row: 1, col: 1 })
    );
    expect(state1.selectedCell).toEqual({ row: 1, col: 1 });

    const state2 = spreadsheetReducer(
      state1,
      spreadsheetActions.setSelection({
        rowStart: 0,
        colStart: 0,
        rowEnd: 1,
        colEnd: 1,
      })
    );
    expect(state2.selection).toEqual({
      rowStart: 0,
      colStart: 0,
      rowEnd: 1,
      colEnd: 1,
    });

    const state3 = spreadsheetReducer(
      state2,
      spreadsheetActions.clearSelection()
    );
    expect(state3.selectedCell).toEqual({ row: 0, col: 0 });
    expect(state3.selection).toEqual({
      rowStart: 0,
      rowEnd: 0,
      colStart: 0,
      colEnd: 0,
    });
  });

  it("should handle setColWidth and setRowHeight with minimum constraints", () => {
    const initialState = getInitialState();

    // Column Width
    const state1 = spreadsheetReducer(
      initialState,
      spreadsheetActions.setColWidth({ col: 0, width: 200 })
    );
    expect(state1.colWidths["col-1"]).toBe(200);
    expect(state1.past.length).toBe(1);

    // Col width below minimum
    const state2 = spreadsheetReducer(
      state1,
      spreadsheetActions.setColWidth({ col: 0, width: 10 })
    );
    expect(state2.colWidths["col-1"]).toBe(MIN_COL_WIDTH);

    // Row Height
    const state3 = spreadsheetReducer(
      state2,
      spreadsheetActions.setRowHeight({ row: 0, height: 100 })
    );
    expect(state3.rowHeights["row-1"]).toBe(100);
    expect(state3.past.length).toBe(3);

    // Row height below minimum
    const state4 = spreadsheetReducer(
      state3,
      spreadsheetActions.setRowHeight({ row: 0, height: 5 })
    );
    expect(state4.rowHeights["row-1"]).toBe(MIN_ROW_HEIGHT);
  });

  it("should handle setGridSize, growing and shrinking dynamically", () => {
    const initialState = getInitialState();

    // Grow
    const state1 = spreadsheetReducer(
      initialState,
      spreadsheetActions.setGridSize({ rows: 3, cols: 3 })
    );
    expect(state1.gridSize).toEqual({ rows: 3, cols: 3 });
    expect(state1.gridSnapshot.rowIds.length).toBe(3);
    expect(state1.gridSnapshot.colIds.length).toBe(3);
    expect(state1.past.length).toBe(1);

    // Shrink
    const state2 = spreadsheetReducer(
      state1,
      spreadsheetActions.setGridSize({ rows: 1, cols: 1 })
    );
    expect(state2.gridSize).toEqual({ rows: 1, cols: 1 });
    expect(state2.gridSnapshot.rowIds.length).toBe(1);
    expect(state2.gridSnapshot.colIds.length).toBe(1);
  });

  it("should handle insertColumn and deleteColumn", () => {
    const initialState = getInitialState();

    // Insert left
    const state1 = spreadsheetReducer(
      initialState,
      spreadsheetActions.insertColumn({ col: 0, position: "left" })
    );
    expect(state1.gridSize.cols).toBe(3);
    expect(state1.gridSnapshot.colIds.length).toBe(3);
    expect(state1.gridSnapshot.colIds[1]).toBe("col-1"); // col-1 shifted right

    // Delete column
    const state2 = spreadsheetReducer(
      state1,
      spreadsheetActions.deleteColumn(1) // delete the column that was col-1
    );
    expect(state2.gridSize.cols).toBe(2);
    expect(state2.gridSnapshot.colIds.length).toBe(2);
  });

  it("should handle insertRow and deleteRow", () => {
    const initialState = getInitialState();

    // Insert above
    const state1 = spreadsheetReducer(
      initialState,
      spreadsheetActions.insertRow({ row: 0, position: "above" })
    );
    expect(state1.gridSize.rows).toBe(3);
    expect(state1.gridSnapshot.rowIds.length).toBe(3);
    expect(state1.gridSnapshot.rowIds[1]).toBe("row-1"); // shifted down

    // Delete row
    const state2 = spreadsheetReducer(state1, spreadsheetActions.deleteRow(1));
    expect(state2.gridSize.rows).toBe(2);
    expect(state2.gridSnapshot.rowIds.length).toBe(2);
  });

  it("should handle undo and redo", () => {
    const initialState = getInitialState();

    // Perform an edit
    const state1 = spreadsheetReducer(
      initialState,
      spreadsheetActions.updateCell({ row: 0, col: 0, value: "A" })
    );
    expect(state1.gridSnapshot.cells["row-1_col-1"]).toBe("A");

    // Perform another edit
    const state2 = spreadsheetReducer(
      state1,
      spreadsheetActions.updateCell({ row: 0, col: 0, value: "B" })
    );
    expect(state2.gridSnapshot.cells["row-1_col-1"]).toBe("B");
    expect(state2.past.length).toBe(2);
    expect(state2.future.length).toBe(0);

    // Undo 1
    const state3 = spreadsheetReducer(state2, spreadsheetActions.undo());
    expect(state3.gridSnapshot.cells["row-1_col-1"]).toBe("A");
    expect(state3.past.length).toBe(1);
    expect(state3.future.length).toBe(1);

    // Undo 2
    const state4 = spreadsheetReducer(state3, spreadsheetActions.undo());
    expect(state4.gridSnapshot.cells["row-1_col-1"]).toBeUndefined();
    expect(state4.past.length).toBe(0);
    expect(state4.future.length).toBe(2);

    // Undo 3 (no-op)
    const state5 = spreadsheetReducer(state4, spreadsheetActions.undo());
    expect(state5.past.length).toBe(0);

    // Redo 1
    const state6 = spreadsheetReducer(state5, spreadsheetActions.redo());
    expect(state6.gridSnapshot.cells["row-1_col-1"]).toBe("A");
    expect(state6.past.length).toBe(1);
    expect(state6.future.length).toBe(1);

    // Redo 2
    const state7 = spreadsheetReducer(state6, spreadsheetActions.redo());
    expect(state7.gridSnapshot.cells["row-1_col-1"]).toBe("B");
    expect(state7.past.length).toBe(2);
    expect(state7.future.length).toBe(0);
  });
});
