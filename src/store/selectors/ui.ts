import type { RootState } from "@/store";

export const selectSaveStatus = (state: RootState) => state.ui.saveStatus;
