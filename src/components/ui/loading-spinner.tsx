import clsx from "clsx";
import { LoaderIcon } from "lucide-react";
import styles from "./loading-spinner.module.css";

type LoadingSpinnerProps = {
  size?: number;
  className?: string;
};

export function LoadingSpinner({ size = 18, className }: LoadingSpinnerProps) {
  return <LoaderIcon size={size} className={clsx(styles.spinner, className)} />;
}
