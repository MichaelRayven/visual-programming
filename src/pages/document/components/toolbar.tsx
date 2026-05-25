import {
  AlertTriangleIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BaselineIcon,
  BoldIcon,
  CheckCircle2Icon,
  ClipboardIcon,
  CopyIcon,
  ItalicIcon,
  Loader2,
  PaintBucketIcon,
  Redo2Icon,
  ScissorsIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import React from "react";
import { useDocumentSaveStatus } from "@/hooks/useDocumentStore";
import { useActiveCellStyles, useTableStore } from "@/hooks/useTableStore";
import styles from "./toolbar.module.css";

export function TableToolbar() {
  const store = useTableStore();
  const activeStyles = useActiveCellStyles();
  const saveStatus = useDocumentSaveStatus();

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    store.setFormat(
      value ? (value as "number" | "percent" | "currency" | "date") : undefined
    );
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.setBgColor(e.target.value);
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.setTextColor(e.target.value);
  };

  return (
    <div className={styles.toolbar}>
      {/* 1. History Group */}
      <div className={styles.group}>
        <button
          className={styles.btn}
          onClick={() => store.undo()}
          title="Отменить (Ctrl + Z)"
        >
          <Undo2Icon size={16} />
        </button>
        <button
          className={styles.btn}
          onClick={() => store.redo()}
          title="Повторить (Ctrl + Y)"
        >
          <Redo2Icon size={16} />
        </button>
      </div>

      <span className={styles.separator} />

      {/* 2. Clipboard Group */}
      <div className={styles.group}>
        <button
          className={styles.btn}
          onClick={() => store.copySelection()}
          title="Копировать (Ctrl + C)"
        >
          <CopyIcon size={16} />
        </button>
        <button
          className={styles.btn}
          onClick={() => store.cutSelection()}
          title="Вырезать (Ctrl + X)"
        >
          <ScissorsIcon size={16} />
        </button>
        <button
          className={styles.btn}
          onClick={() => store.pasteSelection()}
          title="Вставить (Ctrl + V)"
        >
          <ClipboardIcon size={16} />
        </button>
      </div>

      <span className={styles.separator} />

      {/* 3. Typography Group */}
      <div className={styles.group}>
        <button
          className={`${styles.btn} ${activeStyles.bold ? styles.active : ""}`}
          onClick={() => store.toggleBold()}
          title="Жирный (Ctrl + B)"
        >
          <BoldIcon size={16} />
        </button>
        <button
          className={`${styles.btn} ${activeStyles.italic ? styles.active : ""}`}
          onClick={() => store.toggleItalic()}
          title="Курсив (Ctrl + I)"
        >
          <ItalicIcon size={16} />
        </button>
        <button
          className={`${styles.btn} ${activeStyles.underline ? styles.active : ""}`}
          onClick={() => store.toggleUnderline()}
          title="Подчеркнутый (Ctrl + U)"
        >
          <UnderlineIcon size={16} />
        </button>
      </div>

      <span className={styles.separator} />

      {/* 4. Alignment Group */}
      <div className={styles.group}>
        <button
          className={`${styles.btn} ${activeStyles.align === "left" || !activeStyles.align ? styles.active : ""}`}
          onClick={() => store.setAlign("left")}
          title="Выравнивание по левому краю"
        >
          <AlignLeftIcon size={16} />
        </button>
        <button
          className={`${styles.btn} ${activeStyles.align === "center" ? styles.active : ""}`}
          onClick={() => store.setAlign("center")}
          title="Выравнивание по центру"
        >
          <AlignCenterIcon size={16} />
        </button>
        <button
          className={`${styles.btn} ${activeStyles.align === "right" ? styles.active : ""}`}
          onClick={() => store.setAlign("right")}
          title="Выравнивание по правому краю"
        >
          <AlignRightIcon size={16} />
        </button>
      </div>

      <span className={styles.separator} />

      {/* 5. Colors Group */}
      <div className={styles.group}>
        <div className={styles.colorPickerWrapper} title="Цвет текста">
          <label htmlFor="text-color-picker" className={styles.btn}>
            <BaselineIcon size={16} />
          </label>
          <input
            id="text-color-picker"
            type="color"
            className={styles.colorInput}
            value={activeStyles.textColor || "#000000"}
            onChange={handleTextColorChange}
          />
        </div>
        <div className={styles.colorPickerWrapper} title="Цвет фона ячейки">
          <label htmlFor="bg-color-picker" className={styles.btn}>
            <PaintBucketIcon size={16} />
          </label>
          <input
            id="bg-color-picker"
            type="color"
            className={styles.colorInput}
            value={activeStyles.bgColor || "#ffffff"}
            onChange={handleBgColorChange}
          />
        </div>
      </div>

      <span className={styles.separator} />

      {/* 6. Format Select Group */}
      <div className={styles.group}>
        <select
          className={styles.formatSelect}
          value={activeStyles.format || ""}
          onChange={handleFormatChange}
          title="Числовой формат ячейки"
        >
          <option value="">Обычный текст</option>
          <option value="number">Число</option>
          <option value="percent">Процент (%)</option>
          <option value="currency">Валюта (₽)</option>
          <option value="date">Дата (ДД.ММ.ГГГГ)</option>
        </select>
      </div>

      {/* Right side: Save status */}
      <div className={styles.saveStatus}>
        {saveStatus === "saving" && (
          <div className={`${styles.statusIndicator} ${styles.statusSaving}`}>
            <Loader2 className={styles.spinnerIcon} size={14} />
            <span>Сохранение...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          <div className={`${styles.statusIndicator} ${styles.statusSaved}`}>
            <CheckCircle2Icon size={14} />
            <span>Сохранено</span>
          </div>
        )}
        {saveStatus === "error" && (
          <div className={`${styles.statusIndicator} ${styles.statusError}`}>
            <AlertTriangleIcon size={14} />
            <span>Ошибка сохранения</span>
          </div>
        )}
      </div>
    </div>
  );
}
