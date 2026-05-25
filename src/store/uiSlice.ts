import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { saveDocument } from "./documentsSlice";

export type SaveStatus = "saved" | "saving" | "error";

export type NotificationType = "error" | "info" | "success" | "default";

export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
};

export type UIState = {
  modals: {
    createOpen: boolean;
    renameOpen: { id: string; title: string } | null;
    deleteOpen: string | null;
  };
  notifications: Notification[];
  saveStatus: SaveStatus;
};

const initialState: UIState = {
  modals: {
    createOpen: false,
    renameOpen: null,
    deleteOpen: null,
  },
  notifications: [],
  saveStatus: "saved",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCreateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modals.createOpen = action.payload;
    },
    setRenameModal: (
      state,
      action: PayloadAction<{ id: string; title: string } | null>
    ) => {
      state.modals.renameOpen = action.payload;
    },
    setDeleteModal: (state, action: PayloadAction<string | null>) => {
      state.modals.deleteOpen = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<{
        id?: string;
        message: string;
        type: NotificationType;
        duration?: number;
      }>
    ) => {
      const { id, message, type, duration } = action.payload;
      state.notifications.push({
        id: id || Math.random().toString(36).substring(2, 9),
        message,
        type,
        duration,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    setSaveStatus: (state, action: PayloadAction<SaveStatus>) => {
      state.saveStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveDocument.pending, (state) => {
        state.saveStatus = "saving";
      })
      .addCase(saveDocument.fulfilled, (state) => {
        state.saveStatus = "saved";
      })
      .addCase(saveDocument.rejected, (state) => {
        state.saveStatus = "error";
      });
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
