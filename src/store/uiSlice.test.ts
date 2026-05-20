import { describe, expect, it } from "vitest";
import { saveDocument } from "./documentsSlice";
import uiReducer, { type UIState, uiActions } from "./uiSlice";

describe("uiSlice reducer", () => {
  const initialState: UIState = {
    modals: {
      createOpen: false,
      renameOpen: false,
      deleteOpen: false,
    },
    notifications: [],
    saveStatus: "saved",
  };

  it("should return the initial state", () => {
    expect(uiReducer(undefined, { type: "" })).toEqual(initialState);
  });

  it("should handle setCreateModalOpen", () => {
    const nextState = uiReducer(
      initialState,
      uiActions.setCreateModalOpen(true)
    );
    expect(nextState.modals.createOpen).toBe(true);
    expect(nextState.modals.renameOpen).toBe(false);

    const nextStateFalse = uiReducer(
      nextState,
      uiActions.setCreateModalOpen(false)
    );
    expect(nextStateFalse.modals.createOpen).toBe(false);
  });

  it("should handle setRenameModalOpen", () => {
    const nextState = uiReducer(
      initialState,
      uiActions.setRenameModalOpen(true)
    );
    expect(nextState.modals.renameOpen).toBe(true);
  });

  it("should handle setDeleteModalOpen", () => {
    const nextState = uiReducer(
      initialState,
      uiActions.setDeleteModalOpen(true)
    );
    expect(nextState.modals.deleteOpen).toBe(true);
  });

  it("should handle addNotification and removeNotification", () => {
    const nextState = uiReducer(
      initialState,
      uiActions.addNotification({ message: "Test message", type: "success" })
    );
    expect(nextState.notifications.length).toBe(1);
    expect(nextState.notifications[0].message).toBe("Test message");
    expect(nextState.notifications[0].type).toBe("success");
    expect(nextState.notifications[0].id).toBeDefined();

    const notifId = nextState.notifications[0].id;
    const removedState = uiReducer(
      nextState,
      uiActions.removeNotification(notifId)
    );
    expect(removedState.notifications.length).toBe(0);
  });

  it("should handle setSaveStatus", () => {
    const nextState = uiReducer(
      initialState,
      uiActions.setSaveStatus("saving")
    );
    expect(nextState.saveStatus).toBe("saving");
  });

  it("should handle saveDocument async thunk statuses", () => {
    // pending
    const pendingAction = { type: saveDocument.pending.type };
    const pendingState = uiReducer(initialState, pendingAction);
    expect(pendingState.saveStatus).toBe("saving");

    // fulfilled
    const fulfilledAction = { type: saveDocument.fulfilled.type };
    const fulfilledState = uiReducer(pendingState, fulfilledAction);
    expect(fulfilledState.saveStatus).toBe("saved");

    // rejected
    const rejectedAction = { type: saveDocument.rejected.type };
    const rejectedState = uiReducer(pendingState, rejectedAction);
    expect(rejectedState.saveStatus).toBe("error");
  });
});
