import { CheckIcon, Loader2, MailIcon, UserIcon } from "lucide-react";
import { type SubmitEventHandler, useEffect, useState } from "react";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldInput, FieldLabel } from "@/components/ui/field";
import { useAppDispatch, useAppSelector } from "@/store";
import { authActions, updateUserProfile } from "@/store/authSlice";
import styles from "../profile-page.module.css";
import { selectProfileState, selectUser } from "../selectors";

type PersonalInfoState = {
  name: string;
  email: string;
};

type PersonalInfoErrors = {
  name?: string;
  email?: string;
};

function validatePersonalInfo(state: PersonalInfoState): PersonalInfoErrors {
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

export function PersonalInfoForm() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { updateProfileLoading, profileSuccess } =
    useAppSelector(selectProfileState);

  const [formState, setFormState] = useState<PersonalInfoState>({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [errors, setErrors] = useState<PersonalInfoErrors>({});

  useEffect(() => {
    if (user) {
      setFormState({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleChange =
    (field: keyof PersonalInfoState) =>
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
    dispatch(authActions.resetProfileStatus());

    const validationErrors = validatePersonalInfo(formState);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.show(firstError || "Ошибка заполнения формы", { type: "error" });
      return;
    }

    try {
      await dispatch(
        updateUserProfile({
          name: formState.name.trim(),
          email: formState.email.trim(),
        })
      ).unwrap();
      toast.show("Личные данные успешно обновлены!", { type: "success" });
    } catch (err) {
      toast.show(
        typeof err === "string" ? err : "Не удалось обновить профиль",
        { type: "error" }
      );
    } finally {
      dispatch(authActions.resetProfileStatus());
    }
  };

  return (
    <div className={`${styles.card} ${styles.formCard}`}>
      <h3 className={styles.title}>Личные данные</h3>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldLabel htmlFor="name">Ваше имя</FieldLabel>
          <FieldInput
            id="name"
            type="text"
            icon={UserIcon}
            className={styles.inputField}
            value={formState.name}
            required
            disabled={updateProfileLoading}
            onChange={handleChange("name")}
          />
          {errors.name && <p className={styles.errorMessage}>{errors.name}</p>}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="email">Электронная почта</FieldLabel>
          <FieldInput
            id="email"
            type="email"
            icon={MailIcon}
            className={styles.inputField}
            value={formState.email}
            required
            disabled={updateProfileLoading}
            onChange={handleChange("email")}
          />
          {errors.email && (
            <p className={styles.errorMessage}>{errors.email}</p>
          )}
        </FieldGroup>

        <div className={styles.formFooter}>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={updateProfileLoading || profileSuccess}
          >
            {updateProfileLoading ? (
              <>
                <Loader2 className="spinner-icon" size={16} />
                Сохранение...
              </>
            ) : profileSuccess ? (
              <>
                <CheckIcon size={16} />
                Сохранено
              </>
            ) : (
              "Сохранить изменения"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
