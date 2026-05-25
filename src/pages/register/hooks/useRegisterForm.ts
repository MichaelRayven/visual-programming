import { type SubmitEventHandler, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { registerUser } from "@/store/authSlice";
import { type RegisterErrors, type RegisterState } from "../types";
import { validateRegister } from "../utils/validateRegister";

export function useRegisterForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formState, setFormState] = useState<RegisterState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof RegisterState, value: string) => {
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

    const { isValid, errors: validationErrors } = validateRegister(formState);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await dispatch(
        registerUser({
          name: formState.name,
          email: formState.email,
          password: formState.password,
        })
      ).unwrap();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({
        form: (err as string) || "Ошибка при регистрации",
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
