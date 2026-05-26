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
    clipboard: null,
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

  it("should handle formatting actions (bold, italic, underline, colors, align, format)", () => {
    const initialState = getInitialState();

    // Set selection
    const state1 = spreadsheetReducer(
      initialState,
      spreadsheetActions.setSelection({
        rowStart: 0,
        colStart: 0,
        rowEnd: 0,
        colEnd: 1,
      })
    );

    // Toggle Bold (turns on since initially undefined)
    const state2 = spreadsheetReducer(state1, spreadsheetActions.toggleBold());
    expect(state2.gridSnapshot.cellStyles?.["row-1_col-1"]?.bold).toBe(true);
    expect(state2.gridSnapshot.cellStyles?.["row-1_col-2"]?.bold).toBe(true);

    // Toggle Bold again (turns off since all are bold)
    const state3 = spreadsheetReducer(state2, spreadsheetActions.toggleBold());
    expect(state3.gridSnapshot.cellStyles?.["row-1_col-1"]?.bold).toBe(false);

    // Set colors, alignment, format
    const state4 = spreadsheetReducer(
      state3,
      spreadsheetActions.setBgColor("#ff0000")
    );
    const state5 = spreadsheetReducer(
      state4,
      spreadsheetActions.setTextColor("#00ff00")
    );
    const state6 = spreadsheetReducer(
      state5,
      spreadsheetActions.setAlign("center")
    );
    const state7 = spreadsheetReducer(
      state6,
      spreadsheetActions.setFormat("currency")
    );

    expect(state7.gridSnapshot.cellStyles?.["row-1_col-1"]?.bgColor).toBe(
      "#ff0000"
    );
    expect(state7.gridSnapshot.cellStyles?.["row-1_col-1"]?.textColor).toBe(
      "#00ff00"
    );
    expect(state7.gridSnapshot.cellStyles?.["row-1_col-1"]?.align).toBe(
      "center"
    );
    expect(state7.gridSnapshot.cellStyles?.["row-1_col-1"]?.format).toBe(
      "currency"
    );
  });

  it("should handle copy, cut, and paste operations with values and styles", () => {
    const initialState = getInitialState();

    // Set values and styles in selection A1:B1 (row-1_col-1 and row-1_col-2)
    const stateWithData = [
      spreadsheetActions.updateCell({ row: 0, col: 0, value: "A1" }),
      spreadsheetActions.updateCell({ row: 0, col: 1, value: "B1" }),
      spreadsheetActions.setSelection({
        rowStart: 0,
        colStart: 0,
        rowEnd: 0,
        colEnd: 1,
      }),
      spreadsheetActions.toggleBold(), // make bold
    ].reduce(
      (state, action) => spreadsheetReducer(state, action),
      initialState
    );

    expect(stateWithData.gridSnapshot.cells["row-1_col-1"]).toBe("A1");
    expect(stateWithData.gridSnapshot.cellStyles?.["row-1_col-1"]?.bold).toBe(
      true
    );

    // Copy selection
    const stateCopied = spreadsheetReducer(
      stateWithData,
      spreadsheetActions.copySelection()
    );
    expect(stateCopied.clipboard).toBeDefined();
    expect(stateCopied.clipboard?.cells.length).toBe(2);
    expect(stateCopied.clipboard?.isCut).toBe(false);

    // Move selected cell to D2 (row-2_col-1)
    const stateTargetSelected = spreadsheetReducer(
      stateCopied,
      spreadsheetActions.setSelectedCell({ row: 1, col: 0 })
    );

    // Paste selection
    const statePasted = spreadsheetReducer(
      stateTargetSelected,
      spreadsheetActions.pasteSelection()
    );
    expect(statePasted.gridSnapshot.cells["row-2_col-1"]).toBe("A1");
    expect(statePasted.gridSnapshot.cells["row-2_col-2"]).toBe("B1");
    expect(statePasted.gridSnapshot.cellStyles?.["row-2_col-1"]?.bold).toBe(
      true
    );
    expect(statePasted.gridSnapshot.cellStyles?.["row-2_col-2"]?.bold).toBe(
      true
    );

    // Cut selection
    const stateCut = spreadsheetReducer(
      stateWithData,
      spreadsheetActions.cutSelection()
    );
    expect(stateCut.clipboard?.isCut).toBe(true);

    // Paste cut selection to Row 2, Col 1
    const stateTargetSelected2 = spreadsheetReducer(
      stateCut,
      spreadsheetActions.setSelectedCell({ row: 1, col: 0 })
    );
    const statePastedCut = spreadsheetReducer(
      stateTargetSelected2,
      spreadsheetActions.pasteSelection()
    );

    // Source should be cleared!
    expect(statePastedCut.gridSnapshot.cells["row-1_col-1"]).toBeUndefined();
    expect(statePastedCut.gridSnapshot.cells["row-1_col-2"]).toBeUndefined();
    expect(
      statePastedCut.gridSnapshot.cellStyles?.["row-1_col-1"]
    ).toBeUndefined();

    // Target should have the values and styles
    expect(statePastedCut.gridSnapshot.cells["row-2_col-1"]).toBe("A1");
    expect(statePastedCut.gridSnapshot.cellStyles?.["row-2_col-1"]?.bold).toBe(
      true
    );
  });

  it("should handle selectAll and clearSelectedCells", () => {
    const initialState = getInitialState();

    const stateWithData = [
      spreadsheetActions.updateCell({ row: 0, col: 0, value: "A1" }),
      spreadsheetActions.updateCell({ row: 1, col: 1, value: "B2" }),
    ].reduce(
      (state, action) => spreadsheetReducer(state, action),
      initialState
    );

    // Select all
    const stateSelectedAll = spreadsheetReducer(
      stateWithData,
      spreadsheetActions.selectAll()
    );
    expect(stateSelectedAll.selection).toEqual({
      rowStart: 0,
      rowEnd: 1,
      colStart: 0,
      colEnd: 1,
    });

    // Clear selection
    const stateCleared = spreadsheetReducer(
      stateSelectedAll,
      spreadsheetActions.clearSelectedCells()
    );
    expect(stateCleared.gridSnapshot.cells["row-1_col-1"]).toBeUndefined();
    expect(stateCleared.gridSnapshot.cells["row-2_col-2"]).toBeUndefined();
  });

  it("should handle date formatted cells with string-only parsing and string fallbacks", () => {
    const initialState = getInitialState();

    // 1. Initial state with values
    let state = [
      spreadsheetActions.updateCell({ row: 0, col: 0, value: "abc" }),
      spreadsheetActions.updateCell({ row: 0, col: 1, value: "12345" }),
      spreadsheetActions.updateCell({ row: 1, col: 0, value: "2026-05-25" }),
      spreadsheetActions.updateCell({ row: 1, col: 1, value: "01.01.2000" }),
    ].reduce((s, action) => spreadsheetReducer(s, action), initialState);

    // Set selection and set format to date
    state = spreadsheetReducer(
      state,
      spreadsheetActions.setSelection({
        rowStart: 0,
        colStart: 0,
        rowEnd: 1,
        colEnd: 1,
      })
    );
    state = spreadsheetReducer(state, spreadsheetActions.setFormat("date"));

    // Verify conversions
    // abc and 12345 are invalid dates, so they fallback to original string values
    expect(state.gridSnapshot.cells["row-1_col-1"]).toBe("abc");
    expect(state.gridSnapshot.cells["row-1_col-2"]).toBe("12345");

    // valid date strings are parsed and formatted as DD.MM.YYYY
    expect(state.gridSnapshot.cells["row-2_col-1"]).toBe("25.05.2026");
    expect(state.gridSnapshot.cells["row-2_col-2"]).toBe("01.01.2000");

    // 2. Typing directly into a date formatted cell
    // Typing a valid date string
    state = spreadsheetReducer(
      state,
      spreadsheetActions.updateCell({ row: 0, col: 0, value: "25-12-2025" })
    );
    expect(state.gridSnapshot.cells["row-1_col-1"]).toBe("25.12.2025");

    // Typing an invalid date string / number
    state = spreadsheetReducer(
      state,
      spreadsheetActions.updateCell({ row: 0, col: 0, value: "98765" })
    );
    expect(state.gridSnapshot.cells["row-1_col-1"]).toBe("98765");
  });

  it("should undo column and row deletions", () => {
    const initialState = getInitialState();
    // 1. Initialize table with some data
    let state = spreadsheetReducer(
      initialState,
      spreadsheetActions.initTable({
        gridSnapshot: {
          cells: {
            "row-1_col-1": "A",
            "row-1_col-2": "B",
            "row-2_col-1": "C",
            "row-2_col-2": "D",
          },
          rowIds: ["row-1", "row-2"],
          colIds: ["col-1", "col-2"],
        },
        gridSize: { rows: 2, cols: 2 },
        colWidths: { "col-1": 100, "col-2": 100 },
        rowHeights: { "row-1": 30, "row-2": 30 },
      })
    );

    // 2. Delete column 1 (index 1)
    state = spreadsheetReducer(state, spreadsheetActions.deleteColumn(1));
    expect(state.gridSize.cols).toBe(1);
    expect(state.gridSnapshot.colIds).toEqual(["col-1"]);
    expect(state.gridSnapshot.cells).toEqual({
      "row-1_col-1": "A",
      "row-2_col-1": "C",
    });

    // 3. Undo column deletion
    state = spreadsheetReducer(state, spreadsheetActions.undo());
    expect(state.gridSize.cols).toBe(2);
    expect(state.gridSnapshot.colIds).toEqual(["col-1", "col-2"]);
    expect(state.gridSnapshot.cells).toEqual({
      "row-1_col-1": "A",
      "row-1_col-2": "B",
      "row-2_col-1": "C",
      "row-2_col-2": "D",
    });

    // 4. Delete row 1 (index 1)
    state = spreadsheetReducer(state, spreadsheetActions.deleteRow(1));
    expect(state.gridSize.rows).toBe(1);
    expect(state.gridSnapshot.rowIds).toEqual(["row-1"]);
    expect(state.gridSnapshot.cells).toEqual({
      "row-1_col-1": "A",
      "row-1_col-2": "B",
    });

    // 5. Undo row deletion
    state = spreadsheetReducer(state, spreadsheetActions.undo());
    expect(state.gridSize.rows).toBe(2);
    expect(state.gridSnapshot.rowIds).toEqual(["row-1", "row-2"]);
    expect(state.gridSnapshot.cells).toEqual({
      "row-1_col-1": "A",
      "row-1_col-2": "B",
      "row-2_col-1": "C",
      "row-2_col-2": "D",
    });
  });
});
