import clsx from "clsx";
import "./field.css";
import { Input } from "./input";

export const FieldGroup = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={clsx("field-group", className)}>{children}</div>;

export const FieldLabel = ({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) => (
  <label className="field-label" htmlFor={htmlFor}>
    {children}
  </label>
);

export const FieldInput = ({
  error,
  className,
  ...props
}: React.ComponentProps<"input"> & { error?: boolean }) => (
  <Input
    className={clsx({ "field-input-error": error }, className)}
    {...props}
  />
);

export const FieldError = ({ children }: { children: React.ReactNode }) => (
  <span className="field-error">{children}</span>
);
