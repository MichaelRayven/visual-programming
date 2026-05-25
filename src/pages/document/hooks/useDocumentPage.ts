import { useCallback, useEffect, useState } from "react";
import {
  type BlockerFunction,
  useBlocker,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  useDocumentById,
  useDocumentSaveStatus,
} from "@/hooks/useDocumentStore";
import { useAppDispatch } from "@/store";
import { documentsActions } from "@/store/documentsSlice";
import { spreadsheetActions } from "@/store/spreadsheetSlice";

export function useDocumentPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const document = useDocumentById(documentId || "");
  const saveStatus = useDocumentSaveStatus();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;

    setLoading(true);
    setError(null);
    dispatch(documentsActions.setActiveDocumentId(documentId));
    dispatch(spreadsheetActions.clearTable());

    const loadDocument = async (documentId: string) => {
      try {
        const doc = await dispatch(
          documentsActions.fetchDocumentById(documentId)
        ).unwrap();
        dispatch(spreadsheetActions.initTable(doc.tableSnapshot));
      } catch (err) {
        setError(err || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadDocument(documentId);

    return () => {
      dispatch(documentsActions.setActiveDocumentId(null));
      dispatch(spreadsheetActions.clearTable());
    };
  }, [documentId, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isSpreadsheetInput =
        target.classList?.contains("table-cell-input") ||
        target.classList?.contains("table-top-bar-input");
      const isForeignInput =
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
        !isSpreadsheetInput;

      if (isForeignInput) return;

      const key = e.key.toLowerCase();

      if (e.ctrlKey && key === "s") {
        e.preventDefault();
        dispatch(spreadsheetActions.triggerSave());
      } else if (e.ctrlKey && key === "z") {
        e.preventDefault();
        dispatch(spreadsheetActions.undo());
      } else if (e.ctrlKey && key === "y") {
        e.preventDefault();
        dispatch(spreadsheetActions.redo());
      } else if (e.ctrlKey && key === "c") {
        e.preventDefault();
        dispatch(spreadsheetActions.copySelection());
      } else if (e.ctrlKey && key === "x") {
        e.preventDefault();
        dispatch(spreadsheetActions.cutSelection());
      } else if (e.ctrlKey && key === "v") {
        e.preventDefault();
        dispatch(spreadsheetActions.pasteSelection());
      } else if (e.ctrlKey && key === "a") {
        e.preventDefault();
        dispatch(spreadsheetActions.selectAll());
      } else if (e.ctrlKey && key === "b") {
        e.preventDefault();
        dispatch(spreadsheetActions.toggleBold());
      } else if (e.ctrlKey && key === "i") {
        e.preventDefault();
        dispatch(spreadsheetActions.toggleItalic());
      } else if (e.ctrlKey && key === "u") {
        e.preventDefault();
        dispatch(spreadsheetActions.toggleUnderline());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving") {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  const shouldBlock = useCallback<BlockerFunction>(
    () => saveStatus === "saving",
    [saveStatus]
  );

  const blocker = useBlocker(shouldBlock);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return {
    document,
    loading,
    error,
    blocker,
    handleBackToDashboard,
  };
}
