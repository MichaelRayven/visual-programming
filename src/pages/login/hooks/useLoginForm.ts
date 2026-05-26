import { type SubmitEventHandler, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { loginUser } from "@/store/authSlice";
import { type LoginErrors, type LoginState } from "../types";
import { validateLogin } from "../utils/validateLogin";

export function useLoginForm(from: string) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formState, setFormState] = useState<LoginState>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof LoginState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    if (errors.form) {
      setErrors((prev) => ({
        ...prev,
        form: undefined,
      }));
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateLogin(formState);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await dispatch(
        loginUser({ email: formState.email, password: formState.password })
      ).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({
        form: (err as string) || "Неверный адрес электронной почты или пароль",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formState,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
}
