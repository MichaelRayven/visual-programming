import { Dialog } from "@/components/dialog";
import { useDocumentList, useDocumentStore } from "@/hooks/useDocumentStore";

export function DashboardPage() {
  const documents = useDocumentList();
  return (
    <>
      <header></header>
      <main>
        <Dialog trigger={"Test"} />
        <div>
          {documents.map((doc) => (
            <div>{doc.title}</div>
          ))}
        </div>
      </main>
      <footer></footer>
    </>
  );
}
