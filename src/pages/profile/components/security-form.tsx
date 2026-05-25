import { CheckIcon, KeyIcon, Loader2 } from "lucide-react";
import { type SubmitEventHandler, useState } from "react";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldInput, FieldLabel } from "@/components/ui/field";
import { useAppDispatch, useAppSelector } from "@/store";
import { authActions, updateUserPassword } from "@/store/authSlice";
import styles from "../profile-page.module.css";
import { selectPasswordState } from "../selectors";

type SecurityState = {
  password: string;
  confirmPassword: string;
};

type SecurityErrors = {
  password?: string;
  confirmPassword?: string;
};

function validateSecurity(state: SecurityState): SecurityErrors {
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

export function SecurityForm() {
  const dispatch = useAppDispatch();
  const { changePasswordLoading, passwordSuccess } =
    useAppSelector(selectPasswordState);

  const [formState, setFormState] = useState<SecurityState>({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<SecurityErrors>({});

  const handleChange =
    (field: keyof SecurityState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    dispatch(authActions.resetPasswordStatus());

    const validationErrors = validateSecurity(formState);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.show(firstError || "Ошибка изменения пароля", { type: "error" });
      return;
    }

    try {
      const pass = String(formState.password || "");
      await dispatch(updateUserPassword(pass)).unwrap();

      toast.show("Пароль успешно изменен!", { type: "success" });
      setFormState({
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.show(typeof err === "string" ? err : "Не удалось изменить пароль", {
        type: "error",
      });
    } finally {
      dispatch(authActions.resetPasswordStatus());
    }
  };

  return (
    <div className={`${styles.card} ${styles.formCard}`}>
      <h3 className={styles.title}>Безопасность</h3>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldLabel htmlFor="password">Новый пароль</FieldLabel>
          <FieldInput
            id="password"
            type="password"
            icon={KeyIcon}
            placeholder="Минимум 8 символов"
            className={styles.inputField}
            value={formState.password}
            required
            disabled={changePasswordLoading}
            onChange={handleChange("password")}
          />
          {errors.password && (
            <p className={styles.errorMessage}>{errors.password}</p>
          )}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="confirm-password">
            Подтверждение пароля
          </FieldLabel>
          <FieldInput
            id="confirm-password"
            type="password"
            icon={KeyIcon}
            placeholder="Повторите пароль"
            className={styles.inputField}
            value={formState.confirmPassword}
            required
            disabled={changePasswordLoading}
            onChange={handleChange("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className={styles.errorMessage}>{errors.confirmPassword}</p>
          )}
        </FieldGroup>

        <div className={styles.formFooter}>
          <Button
            type="submit"
            variant="outline"
            size="md"
            disabled={changePasswordLoading || passwordSuccess}
          >
            {changePasswordLoading ? (
              <>
                <Loader2 className="spinner-icon" size={16} />
                Обновление...
              </>
            ) : passwordSuccess ? (
              <>
                <CheckIcon size={16} />
                Пароль изменен
              </>
            ) : (
              "Обновить пароль"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
