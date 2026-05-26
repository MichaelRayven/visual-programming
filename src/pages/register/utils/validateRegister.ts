import { type RegisterErrors, type RegisterState } from "../types";

export function validateRegister(state: RegisterState): {
  isValid: boolean;
  errors: RegisterErrors;
} {
  const errors: RegisterErrors = {};
  let isValid = true;

  if (!state.name.trim()) {
    errors.name = "Введите имя";
    isValid = false;
  }

  if (!state.email.trim()) {
    errors.email = "Введите адрес электронной почты";
    isValid = false;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.email)) {
      errors.email = "Неверный формат адреса электронной почты";
      isValid = false;
    }
  }

  if (!state.password) {
    errors.password = "Введите пароль";
    isValid = false;
  } else if (state.password.length < 8) {
    errors.password = "Пароль должен содержать не менее 8 символов";
    isValid = false;
  }

  if (!state.confirmPassword) {
    errors.confirmPassword = "Подтвердите пароль";
    isValid = false;
  } else if (state.password !== state.confirmPassword) {
    errors.confirmPassword = "Пароли не совпадают";
    isValid = false;
  }

  return { isValid, errors };
}
