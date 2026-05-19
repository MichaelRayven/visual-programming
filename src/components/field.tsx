import clsx from "clsx";
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
  <label className={styles.label} htmlFor={htmlFor}>
    {children}
  </label>
);

export const FieldInput = ({
  error,
  className,
  ...props
}: React.ComponentProps<"input"> & { error?: boolean }) => (
  <Input
    className={clsx(styles.input, { [styles.inputError]: error }, className)}
    {...props}
  />
);

export const FieldError = ({ children }: { children: React.ReactNode }) => (
  <span className={styles.error}>{children}</span>
);
