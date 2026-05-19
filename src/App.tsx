import { useRef } from "react";
import { DocumentStoreContext } from "./hooks/useDocumentStore";
import { DocumentStore } from "./stores/document";
import "./App.css";
import { Router } from "./Router";

function App() {
  const documentStoreRef = useRef<DocumentStore>(null);

  if (!documentStoreRef.current) {
    documentStoreRef.current = new DocumentStore();
  }

  return (
    <DocumentStoreContext.Provider value={documentStoreRef.current}>
      <Router />
    </DocumentStoreContext.Provider>
  );
}

export default App;
