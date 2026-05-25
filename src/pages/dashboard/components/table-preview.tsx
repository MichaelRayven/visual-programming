import { evaluateCell } from "@/lib/formula";
import { getCellAddress } from "@/lib/table";
import type { TableSnapshot } from "@/store/spreadsheetSlice";
import styles from "../dashboard-page.module.css";

type TablePreviewProps = {
  snapshot: TableSnapshot;
};

export function TablePreview({ snapshot }: TablePreviewProps) {
  const { rows, cols } = snapshot.gridSize;
  const previewRows = Math.min(rows, 3);
  const previewCols = Math.min(cols, 3);

  return (
    <div
      className={styles.documentPreviewGrid}
      style={{ "--preview-cols": previewCols } as React.CSSProperties}
    >
      {Array.from({ length: previewRows }).map((_, r) =>
        Array.from({ length: previewCols }).map((_, c) => {
          const cellAddress = getCellAddress(r, c);
          const cellData = evaluateCell(cellAddress, snapshot.gridSnapshot);
          const displayValue =
            typeof cellData.value === "boolean"
              ? cellData.value.toString()
              : cellData.value;

          return (
            <div key={`${r}-${c}`} className={styles.documentPreviewCell}>
              {displayValue}
            </div>
          );
        })
      )}
    </div>
  );
}
