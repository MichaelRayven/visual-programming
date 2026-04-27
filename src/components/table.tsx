import { Input } from "@/components/input";
import type { MouseEventHandler } from "react";

export const Table = () => {
  return "table";
};

export const TableRow = () => {
  return "table";
};

export const TableHeader = () => {
  return "table";
};

export const TableCell = () => {
  const clickHandler: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };

  return (
    <div onClick={clickHandler}>
      <Input />
    </div>
  );
};
