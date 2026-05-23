import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { spreadsheetActions } from "@/store/spreadsheetSlice";

export function useSpreadsheetShortcuts(saveStatus: string | null) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        dispatch(spreadsheetActions.triggerSave());
      } else if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        dispatch(spreadsheetActions.undo());
      } else if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        dispatch(spreadsheetActions.redo());
      } else if (e.ctrlKey && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        dispatch(spreadsheetActions.redo());
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveStatus, dispatch]);
}
