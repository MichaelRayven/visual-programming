import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
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
  icon: Icon,
  ...props
}: React.ComponentProps<"input"> & { error?: boolean; icon?: LucideIcon }) => {
  if (Icon) {
    return (
      <div className="field-input-icon-wrapper">
        <Icon size={16} className="field-input-icon" />
        <Input
          className={clsx(
            { "field-input-error": error },
            "field-input-with-icon",
            className
          )}
          {...props}
        />
      </div>
    );
  }
  return (
    <Input
      className={clsx({ "field-input-error": error }, className)}
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
}) => <span className={clsx("field-error", className)}>{children}</span>;
