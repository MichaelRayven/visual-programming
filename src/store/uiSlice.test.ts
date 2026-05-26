import { describe, expect, it } from "vitest";
import { saveDocument } from "./documentsSlice";
import uiReducer, { type UIState, uiActions } from "./uiSlice";

describe("uiSlice reducer", () => {
  const initialState: UIState = {
    modals: {
      createOpen: false,
      renameOpen: null,
      deleteOpen: null,
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
    expect(nextState.modals.renameOpen).toBeNull();

    const nextStateFalse = uiReducer(
      nextState,
      uiActions.setCreateModalOpen(false)
    );
    expect(nextStateFalse.modals.createOpen).toBe(false);
  });

  it("should handle setRenameModal", () => {
    const payload = { id: "doc-123", title: "Target Title" };
    const nextState = uiReducer(
      initialState,
      uiActions.setRenameModal(payload)
    );
    expect(nextState.modals.renameOpen).toEqual(payload);

    const clearedState = uiReducer(nextState, uiActions.setRenameModal(null));
    expect(clearedState.modals.renameOpen).toBeNull();
  });

  it("should handle setDeleteModal", () => {
    const nextState = uiReducer(
      initialState,
      uiActions.setDeleteModal("doc-123")
    );
    expect(nextState.modals.deleteOpen).toBe("doc-123");

    const clearedState = uiReducer(nextState, uiActions.setDeleteModal(null));
    expect(clearedState.modals.deleteOpen).toBeNull();
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
