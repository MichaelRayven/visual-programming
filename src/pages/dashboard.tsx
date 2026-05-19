import { useState } from "react";
import { CreateDocumentDialog } from "@/components/create-document-dialog";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";
import { useDocumentList, useDocumentStore } from "@/hooks/useDocumentStore";

export function DashboardPage() {
  const documents = useDocumentList();

  return (
    <>
      <header></header>
      <main>
        <CreateDocumentDialog />
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
