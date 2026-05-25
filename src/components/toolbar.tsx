import {
  AlertTriangle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  CheckCircle2,
  Clipboard,
  Copy,
  Italic,
  Loader2,
  PaintBucket,
  Redo2,
  Scissors,
  Underline,
  Undo2,
} from "lucide-react";
import React from "react";
import { useDocumentSaveStatus } from "@/hooks/useDocumentStore";
import { useActiveCellStyles, useTableStore } from "@/hooks/useTableStore";
import "@/components/toolbar.css";

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
    <div className="table-toolbar">
      {/* 1. History Group */}
      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={() => store.undo()}
          title="Отменить (Ctrl + Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={() => store.redo()}
          title="Повторить (Ctrl + Y)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      <span className="toolbar-separator" />

      {/* 2. Clipboard Group */}
      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={() => store.copySelection()}
          title="Копировать (Ctrl + C)"
        >
          <Copy size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={() => store.cutSelection()}
          title="Вырезать (Ctrl + X)"
        >
          <Scissors size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={() => store.pasteSelection()}
          title="Вставить (Ctrl + V)"
        >
          <Clipboard size={16} />
        </button>
      </div>

      <span className="toolbar-separator" />

      {/* 3. Typography Styles Group */}
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${activeStyles.bold ? "active" : ""}`}
          onClick={() => store.toggleBold()}
          title="Жирный (Ctrl + B)"
        >
          <Bold size={16} />
        </button>
        <button
          className={`toolbar-btn ${activeStyles.italic ? "active" : ""}`}
          onClick={() => store.toggleItalic()}
          title="Курсив (Ctrl + I)"
        >
          <Italic size={16} />
        </button>
        <button
          className={`toolbar-btn ${activeStyles.underline ? "active" : ""}`}
          onClick={() => store.toggleUnderline()}
          title="Подчеркнутый (Ctrl + U)"
        >
          <Underline size={16} />
        </button>
      </div>

      <span className="toolbar-separator" />

      {/* 4. Alignment Group */}
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${
            activeStyles.align === "left" || !activeStyles.align ? "active" : ""
          }`}
          onClick={() => store.setAlign("left")}
          title="Выравнивание по левому краю"
        >
          <AlignLeft size={16} />
        </button>
        <button
          className={`toolbar-btn ${
            activeStyles.align === "center" ? "active" : ""
          }`}
          onClick={() => store.setAlign("center")}
          title="Выравнивание по центру"
        >
          <AlignCenter size={16} />
        </button>
        <button
          className={`toolbar-btn ${
            activeStyles.align === "right" ? "active" : ""
          }`}
          onClick={() => store.setAlign("right")}
          title="Выравнивание по правому краю"
        >
          <AlignRight size={16} />
        </button>
      </div>

      <span className="toolbar-separator" />

      {/* 5. Colors Picker Group */}
      <div className="toolbar-group">
        <div className="color-picker-wrapper" title="Цвет текста">
          <label htmlFor="text-color-picker" className="toolbar-btn">
            <Baseline size={16} />
          </label>
          <input
            id="text-color-picker"
            type="color"
            className="color-input"
            value={activeStyles.textColor || "#000000"}
            onChange={handleTextColorChange}
          />
        </div>
        <div className="color-picker-wrapper" title="Цвет фона ячейки">
          <label htmlFor="bg-color-picker" className="toolbar-btn">
            <PaintBucket size={16} />
          </label>
          <input
            id="bg-color-picker"
            type="color"
            className="color-input"
            value={activeStyles.bgColor || "#ffffff"}
            onChange={handleBgColorChange}
          />
        </div>
      </div>

      <span className="toolbar-separator" />

      {/* 6. Formats Selection Group */}
      <div className="toolbar-group">
        <select
          className="toolbar-select"
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
      <div className="toolbar-save-status">
        {saveStatus === "saving" && (
          <div className="status-indicator status-saving">
            <Loader2 className="spinner-icon" size={14} />
            <span>Сохранение...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          <div className="status-indicator status-saved">
            <CheckCircle2 size={14} />
            <span>Сохранено</span>
          </div>
        )}
        {saveStatus === "error" && (
          <div className="status-indicator status-error">
            <AlertTriangle size={14} />
            <span>Ошибка сохранения</span>
          </div>
        )}
      </div>
    </div>
  );
}
