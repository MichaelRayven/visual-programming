import { type SubmitEventHandler, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import {
  FieldError,
  FieldGroup,
  FieldInput,
  FieldLabel,
} from "@/components/ui/field";
import { useDocumentStore, useUIModals } from "@/hooks/useDocumentStore";
import styles from "./create-document-dialog.module.css";

type CreateDocumentState = {
  title: string;
  rows: string;
  cols: string;
};

type CreateDocumentErrors = {
  rows?: string;
  cols?: string;
};

function validateCreateDocument(state: CreateDocumentState): {
  isValid: boolean;
  errors: CreateDocumentErrors;
} {
  const errors: CreateDocumentErrors = {};
  const r = parseInt(state.rows);
  const c = parseInt(state.cols);

  if (isNaN(r) || r <= 0) errors.rows = "Укажите корректное число";
  if (isNaN(c) || c <= 0) errors.cols = "Укажите корректное число";

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function CreateDocumentDialog() {
  const documentStore = useDocumentStore();
  const { createOpen } = useUIModals();

  const [formState, setFormState] = useState<CreateDocumentState>({
    title: "",
    rows: "",
    cols: "",
  });
  const [errors, setErrors] = useState<CreateDocumentErrors>({});

  const handleChange = (field: keyof CreateDocumentState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof CreateDocumentErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } =
      validateCreateDocument(formState);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    documentStore.createDocument(
      formState.title,
      parseInt(formState.rows),
      parseInt(formState.cols)
    );
    setErrors({});
    setFormState({ title: "", rows: "", cols: "" });
    documentStore.setCreateModalOpen(false);
  };

  return (
    <Dialog
      open={createOpen}
      onOpenChange={(open) => documentStore.setCreateModalOpen(open)}
      trigger="Создать файл"
      title="Новый документ"
      content={
        <form id="create-document-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldLabel htmlFor="doc-name">Название</FieldLabel>
            <FieldInput
              id="doc-name"
              value={formState.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </FieldGroup>

          <FieldLabel htmlFor="doc-rows">Начальный размер</FieldLabel>
          <div className={styles.sizeGrid}>
            <FieldGroup className={styles.sizeGridItem}>
              <FieldInput
                id="doc-rows"
                placeholder="Строк"
                value={formState.rows}
                error={!!errors.rows}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d+$/.test(v)) handleChange("rows", v);
                }}
              />
              {errors.rows && <FieldError>{errors.rows}</FieldError>}
            </FieldGroup>

            <span className={styles.multiplier}>×</span>

            <FieldGroup className={styles.sizeGridItem}>
              <FieldInput
                placeholder="Столбцов"
                value={formState.cols}
                error={!!errors.cols}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d+$/.test(v)) handleChange("cols", v);
                }}
              />
              {errors.cols && <FieldError>{errors.cols}</FieldError>}
            </FieldGroup>
          </div>
        </form>
      }
      footer={
        <button
          type="submit"
          form="create-document-form"
          className={styles.submitButton}
        >
          Создать
        </button>
      }
    />
  );
}
