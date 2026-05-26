import {
  type SecurityErrors,
  type SecurityState,
} from "@/pages/profile/types/security";

export function validateSecurity(state: SecurityState): SecurityErrors {
  const errors: SecurityErrors = {};
  const pass = String(state.password || "");
  const confirm = String(state.confirmPassword || "");

  if (pass.length < 8) {
    errors.password = "Пароль должен содержать не менее 8 символов";
  }

  if (pass !== confirm) {
    errors.confirmPassword = "Пароли не совпадают";
  }

  return errors;
}
