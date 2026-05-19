import { useOpenDocument } from "./hooks/useDocumentStore";
import { DashboardPage } from "./pages/dashboard";
import { DocumentPage } from "./pages/document";

export function Router() {
  const openDocument = useOpenDocument();

  if (openDocument) {
    return <DocumentPage document={openDocument} />;
  }

  return <DashboardPage />;
}
