import type {
  PersonalInfoErrors,
  PersonalInfoState,
} from "@/pages/profile/types/personalInfo";

export function validatePersonalInfo(
  state: PersonalInfoState
): PersonalInfoErrors {
  const errors: PersonalInfoErrors = {};
  if (!state.name.trim()) {
    errors.name = "Имя не может быть пустым";
  }
  if (!state.email.trim()) {
    errors.email = "Электронная почта не может быть пустой";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.email = "Неверный формат электронной почты";
  }
  return errors;
}
