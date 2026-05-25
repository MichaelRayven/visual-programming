import {
  type RenameDocumentErrors,
  type RenameDocumentState,
} from "@/pages/dashboard/types/renameDocument";

export function validateRenameDocument(state: RenameDocumentState): {
  isValid: boolean;
  errors: RenameDocumentErrors;
} {
  const errors: RenameDocumentErrors = {};
  if (!state.name.trim()) errors.name = "Название не может быть пустым";
  return { isValid: Object.keys(errors).length === 0, errors };
}
