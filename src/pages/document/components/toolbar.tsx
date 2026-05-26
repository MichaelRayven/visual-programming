import clsx from "clsx";
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
  Loader2Icon,
  PaintBucketIcon,
  Redo2Icon,
  ScissorsIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useActiveCellStyles, useTableStore } from "@/hooks/useTableStore";
import { useAppSelector } from "@/store";
import { selectSaveStatus } from "@/store/selectors/ui";
import styles from "./toolbar.module.css";

export function TableToolbar() {
  const store = useTableStore();
  const activeStyles = useActiveCellStyles();
  const saveStatus = useAppSelector(selectSaveStatus);

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
    <div className={styles.tableToolbar}>
      {/* 1. History Group */}
      <div className={styles.toolbarGroup}>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => store.undo()}
          title="Отменить (Ctrl + Z)"
        >
          <Undo2Icon size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => store.redo()}
          title="Повторить (Ctrl + Y)"
        >
          <Redo2Icon size={16} />
        </Button>
      </div>

      <span className={styles.toolbarSeparator} />

      {/* 2. Clipboard Group */}
      <div className={styles.toolbarGroup}>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => store.copySelection()}
          title="Копировать (Ctrl + C)"
        >
          <CopyIcon size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => store.cutSelection()}
          title="Вырезать (Ctrl + X)"
        >
          <ScissorsIcon size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => store.pasteSelection()}
          title="Вставить (Ctrl + V)"
        >
          <ClipboardIcon size={16} />
        </Button>
      </div>

      <span className={styles.toolbarSeparator} />

      {/* 3. Typography Styles Group */}
      <div className={styles.toolbarGroup}>
        <Button
          size="icon"
          variant="ghost"
          className={clsx({ [styles.active]: activeStyles.bold })}
          onClick={() => store.toggleBold()}
          title="Жирный (Ctrl + B)"
        >
          <BoldIcon size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className={clsx({ [styles.active]: activeStyles.italic })}
          onClick={() => store.toggleItalic()}
          title="Курсив (Ctrl + I)"
        >
          <ItalicIcon size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className={clsx({ [styles.active]: activeStyles.underline })}
          onClick={() => store.toggleUnderline()}
          title="Подчеркнутый (Ctrl + U)"
        >
          <UnderlineIcon size={16} />
        </Button>
      </div>

      <span className={styles.toolbarSeparator} />

      {/* 4. Alignment Group */}
      <div className={styles.toolbarGroup}>
        <Button
          size="icon"
          variant="ghost"
          className={clsx({
            [styles.active]:
              activeStyles.align === "left" || !activeStyles.align,
          })}
          onClick={() => store.setAlign("left")}
          title="Выравнивание по левому краю"
        >
          <AlignLeftIcon size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className={clsx({ [styles.active]: activeStyles.align === "center" })}
          onClick={() => store.setAlign("center")}
          title="Выравнивание по центру"
        >
          <AlignCenterIcon size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className={clsx({ [styles.active]: activeStyles.align === "right" })}
          onClick={() => store.setAlign("right")}
          title="Выравнивание по правому краю"
        >
          <AlignRightIcon size={16} />
        </Button>
      </div>

      <span className={styles.toolbarSeparator} />

      {/* 5. Colors Picker Group */}
      <div className={styles.toolbarGroup}>
        <div className={styles.colorPickerWrapper} title="Цвет текста">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => store.setTextColor(undefined)}
          >
            <BaselineIcon size={16} />
          </Button>
          <input
            id="text-color-picker"
            type="color"
            className={styles.colorInput}
            value={activeStyles.textColor || "#ffffff"}
            onChange={handleTextColorChange}
          />
        </div>
        <div className={styles.colorPickerWrapper} title="Цвет фона ячейки">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => store.setBgColor(undefined)}
          >
            <PaintBucketIcon size={16} />
          </Button>
          <input
            id="bg-color-picker"
            type="color"
            className={styles.colorInput}
            value={activeStyles.bgColor || "#ffffff"}
            onChange={handleBgColorChange}
          />
        </div>
      </div>

      <span className={styles.toolbarSeparator} />

      {/* 6. Formats Selection Group */}
      <div className={styles.toolbarGroup}>
        <select
          className={styles.toolbarSelect}
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

      {/* Right side: Save indicators */}
      <div className={styles.toolbarSaveStatus}>
        {saveStatus === "saving" && (
          <div className={`${styles.statusIndicator} ${styles.statusSaving}`}>
            <Loader2Icon className={styles.spinnerIcon} size={16} />
            <span>Сохранение...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          <div className={`${styles.statusIndicator} ${styles.statusSaved}`}>
            <CheckCircle2Icon size={16} />
            <span>Сохранено</span>
          </div>
        )}
        {saveStatus === "error" && (
          <div className={`${styles.statusIndicator} ${styles.statusError}`}>
            <AlertTriangleIcon size={16} />
            <span>Ошибка сохранения</span>
          </div>
        )}
      </div>
    </div>
  );
}
