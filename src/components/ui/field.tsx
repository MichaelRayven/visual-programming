import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import styles from "./field.module.css";
import { Input } from "./input";

export const FieldGroup = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={clsx(styles.fieldGroup, className)}>{children}</div>;

export const FieldLabel = ({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) => (
  <label className={styles.fieldLabel} htmlFor={htmlFor}>
    {children}
  </label>
);

export const FieldInput = ({
  error,
  className,
  icon: Icon,
  ...props
}: React.ComponentProps<"input"> & { error?: boolean; icon?: LucideIcon }) => {
  if (Icon) {
    return (
      <div className={styles.fieldInputIconWrapper}>
        <Icon size={16} className={styles.fieldInputIcon} />
        <Input
          className={clsx(
            error && styles.fieldInputError,
            styles.fieldInputWithIcon,
            className
          )}
          {...props}
        />
      </div>
    );
  }
  return (
    <Input
      className={clsx(error && styles.fieldInputError, className)}
      {...props}
    />
  );
};

export const FieldError = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <span className={clsx(styles.fieldError, className)}>{children}</span>;
