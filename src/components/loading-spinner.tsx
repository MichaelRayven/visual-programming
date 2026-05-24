import clsx from "clsx";
import { LoaderIcon } from "lucide-react";

type LoadingSpinnerProps = {
  size?: number;
  className?: string;
};

export function LoadingSpinner({ size = 18, className }: LoadingSpinnerProps) {
  return <LoaderIcon size={size} className={clsx("animate-spin", className)} />;
}
