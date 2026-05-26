import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  FieldError,
  FieldGroup,
  FieldInput,
  FieldLabel,
} from "@/components/ui/field";
import { useUIModals } from "@/hooks/useDocumentStore";
import { useAppDispatch } from "@/store";
import { uiActions } from "@/store/uiSlice";
import { useCreateDocumentForm } from "../hooks/useCreateDocumentForm";
import styles from "./create-document-dialog.module.css";

export function CreateDocumentDialog() {
  const dispatch = useAppDispatch();
  const { createOpen } = useUIModals();

  const { formState, errors, loading, handleChange, handleSubmit } =
    useCreateDocumentForm();

  return (
    <Dialog
      open={createOpen}
      onOpenChange={(open) => dispatch(uiActions.setCreateModalOpen(open))}
      trigger="Создать файл"
      title="Новый документ"
      content={
        <form id="create-document-form" onSubmit={handleSubmit}>
          {errors.form && <div className={styles.formError}>{errors.form}</div>}

          <FieldGroup>
            <FieldLabel htmlFor="doc-name">Название</FieldLabel>
            <FieldInput
              id="doc-name"
              value={formState.title}
              error={!!errors.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            {errors.title && <FieldError>{errors.title}</FieldError>}
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
        <Button type="submit" form="create-document-form" disabled={loading}>
          {loading ? "Создание..." : "Создать"}
        </Button>
      }
    />
  );
}
