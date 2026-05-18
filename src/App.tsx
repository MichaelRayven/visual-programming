import { useRef, useState } from "react";
import { DocumentStoreContext } from "./hooks/useDocumentStore";
import { HomePage } from "./pages";
import { DocumentPage } from "./pages/document";
import { DocumentStore } from "./stores/document";
import "./App.css";

function App() {
  const documentStoreRef = useRef<DocumentStore>(null);
  const [documentId, _setDocumentId] = useState<string | null>(null);

  if (!documentStoreRef.current) {
    documentStoreRef.current = new DocumentStore();
  }

  const renderDocumentPage = (documentId: string) => (
    <DocumentPage id={documentId} />
  );

  const renderHomePage = () => <HomePage />;

  return (
    <DocumentStoreContext.Provider value={documentStoreRef.current}>
      {documentId ? renderDocumentPage(documentId) : renderHomePage()}
    </DocumentStoreContext.Provider>
  );
}

export default App;
