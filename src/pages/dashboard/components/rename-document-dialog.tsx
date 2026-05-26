import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  FieldError,
  FieldGroup,
  FieldInput,
  FieldLabel,
} from "@/components/ui/field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUIModals } from "@/hooks/useDocumentStore";
import { useRenameDocumentForm } from "@/pages/dashboard/hooks/useRenameDocumentForm";
import { useAppDispatch } from "@/store";
import { uiActions } from "@/store/uiSlice";

export function RenameDocumentDialog() {
  const dispatch = useAppDispatch();
  const { renameOpen } = useUIModals();
  const { formState, errors, loading, handleChange, handleSubmit } =
    useRenameDocumentForm();

  return (
    <Dialog
      open={!!renameOpen}
      onOpenChange={() => dispatch(uiActions.setRenameModal(null))}
      title="Переименовать документ"
      content={
        <form id="rename-document-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldLabel htmlFor="rename-title">Новое название</FieldLabel>
            <FieldInput
              id="rename-title"
              value={formState.name}
              error={!!errors.name}
              onChange={(e) => handleChange("name", e.target.value)}
              autoFocus
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </FieldGroup>
        </form>
      }
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => dispatch(uiActions.setRenameModal(null))}
          >
            Отмена
          </Button>
          <Button type="submit" form="rename-document-form">
            {loading ? (
              <>
                <LoadingSpinner size={18} />
                Переименование...
              </>
            ) : (
              "Переименовать"
            )}
          </Button>
        </>
      }
    />
  );
}
