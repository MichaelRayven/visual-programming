import { type LoginErrors, type LoginState } from "../types";

export function validateLogin(state: LoginState): {
  isValid: boolean;
  errors: LoginErrors;
} {
  const errors: LoginErrors = {};
  let isValid = true;

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

  return { isValid, errors };
}
