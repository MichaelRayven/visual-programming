import { AlertCircleIcon, LoaderIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Table } from "@/components/table";
import {
  useDocumentById,
  useDocumentLoadingStatus,
  useDocumentStore,
} from "@/hooks/useDocumentStore";
import { useSpreadsheetShortcuts } from "@/hooks/useSpreadsheetShortcuts";
import type { RootState } from "@/store";
import { spreadsheetActions } from "@/store/spreadsheetSlice";
import "./document.css";

export function DocumentPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const docStore = useDocumentStore();
  const document = useDocumentById(documentId || "");
  const loadingStatus = useDocumentLoadingStatus();

  const saveStatus = useSelector((state: RootState) => state.ui.saveStatus);

  useEffect(() => {
    if (!document && loadingStatus === "idle") {
      docStore.fetchDocuments();
    }
  }, [document, loadingStatus, docStore]);

  useEffect(() => {
    if (documentId) {
      docStore.setOpenDocument(documentId);
    }
    return () => {
      docStore.setOpenDocument(null);
    };
  }, [documentId, docStore]);

  const initializedDocId = useRef<string | null>(null);

  useEffect(() => {
    if (document && initializedDocId.current !== document.id) {
      dispatch(spreadsheetActions.initTable(document.tableSnapshot));
      initializedDocId.current = document.id;
    }
  }, [document, dispatch]);

  useSpreadsheetShortcuts(saveStatus);

  const blocker = useBlocker(() => {
    return saveStatus === "saving";
  });

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (!document && loadingStatus === "loading") {
    return (
      <div className="not-found-container">
        <div className="not-found-card">
          <LoaderIcon
            size={40}
            className="animate-spin document-loading-icon"
          />
          <h2 className="not-found-subtitle document-loading-title">
            Загрузка документа...
          </h2>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="not-found-container">
        <div className="not-found-card">
          <AlertCircleIcon size={48} className="document-error-icon" />
          <h2 className="not-found-subtitle">Документ не найден</h2>
          <p className="not-found-description">
            К сожалению, запрашиваемый вами документ не существует или к нему
            нет доступа.
          </p>
          <Button variant="primary" size="md" onClick={handleBackToDashboard}>
            Вернуться в список документов
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-page">
      <main className="document-main">
        <Table snapshot={document.tableSnapshot} />
      </main>

      {/* Unsaved changes blocker dialog */}
      <Dialog
        open={blocker.state === "blocked"}
        onOpenChange={() => {
          if (blocker.state === "blocked") {
            blocker.reset();
          }
        }}
        title="Несохраняемые изменения"
        content="В данный момент происходит автосохранение документа. Если вы покинете страницу сейчас, последние изменения могут быть утеряны. Вы уверены, что хотите уйти?"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (blocker.state === "blocked") {
                  blocker.reset();
                }
              }}
            >
              Остаться
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (blocker.state === "blocked") {
                  blocker.proceed();
                }
              }}
            >
              Уйти
            </Button>
          </>
        }
      />
    </div>
  );
}
