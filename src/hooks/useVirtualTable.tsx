import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT } from "@/lib/store";
import { useStore } from "./useTable";

const findIndex = (offsets: Float64Array, value: number) => {
  let low = 0;
  let high = offsets.length - 2;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (offsets[mid] <= value) low = mid + 1;
    else high = mid - 1;
  }
  return Math.max(0, low - 1);
};

export function useVirtualTable(
  containerRef: React.RefObject<HTMLElement>,
  buffer = 5 // Extra rows above/below to prevent flickering
) {
  const store = useStore();
  const [scroll, setScroll] = useState({ top: 0, left: 0 });
  const [dimentions, setDimentions] = useState({ height: 0, width: 0 });

  const size = useSyncExternalStore(
    (l) => store.subscribeGridMeta(l),
    () => store.getGridSizeSnapshot()
  );

  const { colIds, rowIds } = useSyncExternalStore(
    (l) => store.subscribeGridMeta(l),
    () => store.getGridSnapshot()
  );

  const widths = useSyncExternalStore(
    (l) => store.subscribeGridMeta(l),
    () => store.getColWidthsSnapshot()
  );

  const heights = useSyncExternalStore(
    (l) => store.subscribeGridMeta(l),
    () => store.getRowHeightsSnapshot()
  );

  console.log(widths);

  const layout = useMemo(() => {
    const colWidths = new Float64Array(size.cols);
    const rowHeights = new Float64Array(size.rows);
    const rowOffsets = new Float64Array(size.rows + 1);
    const colOffsets = new Float64Array(size.cols + 1);

    let top = 0;
    for (let i = 0; i < size.rows; i++) {
      rowOffsets[i] = top;
      rowHeights[i] = heights[rowIds[i]] || DEFAULT_ROW_HEIGHT;
      top += heights[rowIds[i]] || DEFAULT_ROW_HEIGHT;
    }
    rowOffsets[size.rows] = top;

    let left = 0;
    for (let i = 0; i < size.cols; i++) {
      colOffsets[i] = left;
      colWidths[i] = widths[colIds[i]] || DEFAULT_COL_WIDTH;
      left += widths[colIds[i]] || DEFAULT_COL_WIDTH;
    }
    colOffsets[size.cols] = left;

    return {
      rowOffsets,
      colOffsets,
      rowHeights,
      colWidths,
      totalHeight: top,
      totalWidth: left,
    };
  }, [size, widths, heights, colIds, rowIds]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () =>
      setScroll({ top: el.scrollTop, left: el.scrollLeft });
    const onResize = () =>
      setDimentions({ height: el.offsetHeight, width: el.offsetWidth });

    const ro = new ResizeObserver(onResize);

    el.addEventListener("scroll", onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [containerRef]);

  // Compute visible range
  const startRow = Math.max(
    0,
    findIndex(layout.rowOffsets, scroll.top) - buffer
  );
  const endRow = Math.min(
    layout.rowOffsets.length - 2,
    findIndex(layout.rowOffsets, scroll.top + dimentions.height) + buffer
  );

  const startCol = Math.max(
    0,
    findIndex(layout.colOffsets, scroll.left) - buffer
  );
  const endCol = Math.min(
    layout.colOffsets.length - 2,
    findIndex(layout.colOffsets, scroll.left + dimentions.width) + buffer
  );

  return {
    startRow,
    endRow,
    startCol,
    endCol,
    ...layout,
  };
}
