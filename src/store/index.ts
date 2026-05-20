import { configureStore } from "@reduxjs/toolkit";
import documentReducer from "./documentSlice";
import { autoSaveMiddleware } from "./middleware/autoSave";
import tableReducer from "./tableSlice";

export const store = configureStore({
  reducer: {
    document: documentReducer,
    table: tableReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(autoSaveMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
