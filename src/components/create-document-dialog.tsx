import { useState } from "react";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import { Dialog } from "./dialog";
import { Input } from "./input";

export function CreateDocumentDialog() {
  const documentStore = useDocumentStore();
  const [title, setTitle] = useState("");
  const [size, setSize] = useState({ cols: 0, rows: 0 });

  return (
    <form
      onSubmit={() => documentStore.createDocument(title, size.rows, size.cols)}
    >
      <Dialog
        trigger={"Создать файл"}
        content={
          <>
            <label htmlFor="title">Название</label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label htmlFor="size">Размер таблицы</label>
            <div className="flex">
              <Input
                id="size"
                name="size"
                value={size.cols}
                type="number"
                onChange={(e) =>
                  setSize((prev) => ({
                    cols: Number(e.target.value),
                    rows: prev.rows,
                  }))
                }
              />
              x
              <Input
                id="title"
                name="title"
                value={size.rows}
                type="number"
                onChange={(e) =>
                  setSize((prev) => ({
                    cols: prev.cols,
                    rows: Number(e.target.value),
                  }))
                }
              />
            </div>
          </>
        }
      />
    </form>
  );
}
