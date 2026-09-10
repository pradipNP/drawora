/**
 * Drawora — Constants & Configuration
 * All constant values, tool lists, presets, and lookup tables.
 */
(function (D) {
  "use strict";

  D.DRAW_TOOLS = ["pen", "pencil", "brush", "marker", "highlighter", "spray", "eraser"];
  D.SHAPE_TOOLS = [
    "line",
    "rect",
    "roundrect",
    "ellipse",
    "triangle",
    "arrow",
    "diamond",
    "pentagon",
    "hexagon",
    "star",
  ];
  D.POLYGON_SHAPES = ["triangle", "diamond", "pentagon", "hexagon", "star"];
  D.TEXT_TOOLS = ["text", "sticky"];
  D.EXTRA_TOOLS = ["fill", "eyedropper", "lasso", "laser", "measure", "protractor", "compass"];
  D.TOOLS = ["select", "pan", ...D.DRAW_TOOLS, ...D.SHAPE_TOOLS, ...D.TEXT_TOOLS, ...D.EXTRA_TOOLS];
  D.SHORTCUTS = {
    v: "select",
    h: "pan",
    p: "pen",
    b: "brush",
    e: "eraser",
    t: "text",
    n: "sticky",
    f: "fill",
    i: "eyedropper",
    l: "lasso",
    r: "laser",
    m: "measure",
  };
  D.SIZE_STOPS = [2, 4, 8, 12, 20];
  D.PRESET_COLORS = [
    "#1c1917",
    "#dc2626",
    "#2563eb",
    "#16a34a",
    "#ca8a04",
    "#7c3aed",
  ];
  D.ROUND_RECT_RADIUS = 12;
  D.MIN_SHAPE_SIZE = 2;
  D.MIN_FRAME = 8;
  D.HANDLE_SIZE = 7;
  D.HANDLE_HIT = 10;
  D.ROTATE_OFFSET = 26;
  D.HIT_PADDING = 8;
  D.RULER_SIZE = 22;
  D.SPOTLIGHT_RADIUS = 92;
  D.DUPLICATE_OFFSET = 16;
  D.MAX_HISTORY = 50;
  D.SELECT_COLOR = "#0f766e";
  D.FONT_FAMILY = '"Segoe UI", system-ui, sans-serif';
  D.FONT_STACKS = {
    sans: '"Segoe UI", system-ui, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'Consolas, "Courier New", monospace',
  };
  D.FONT_SIZES = [12, 14, 16, 20, 24, 32, 40, 48, 72];
  D.TEXT_PAD = 12;
  D.TEXT_DEFAULT = { width: 280, height: 48 };
  D.STICKY_DEFAULT = { width: 176, height: 176 };
  D.STICKY_FILL = "#fde68a";
  D.INDENT_STEP = 24;
  D.MAX_INDENT = 6;
  D.LIST_GUTTER = 22;
  D.MIN_TEXT_WIDTH = 80;
  D.MIN_IMAGE = 16;
  D.MAX_IMAGE_PIXELS = 16_000_000;
  D.IMAGE_TYPES = /^image\/(png|jpe?g|gif|webp|bmp|svg\+xml)$/i;
  D.MAX_IMPORT_BYTES = 20_000_000;
  D.MAX_IMPORT_TEXT = 20_000;
  D.MAX_IMPORT_ROWS = 40;
  D.MAX_IMPORT_COLS = 20;
  D.TABLE_DEFAULT_COLS = 3;
  D.TABLE_DEFAULT_ROWS = 3;
  D.TABLE_CELL_MIN = 28;
  D.TABLE_PAD = 6;
  D.TABLE_SPLIT_HIT = 5;
  D.MIN_ZOOM = 0.1;
  D.MAX_ZOOM = 8;
  D.ZOOM_STEP = 1.2;
  D.MIN_PAGE_SIZE = 100;
  D.MAX_PAGE_SIZE = 8000;
  D.PAGE_PRESETS = {
    a4: { width: 794, height: 1123, label: "A4" },
    a3: { width: 1123, height: 1587, label: "A3" },
    a5: { width: 559, height: 794, label: "A5" },
    a2: { width: 1587, height: 2245, label: "A2" },
    letter: { width: 816, height: 1056, label: "Letter" },
    legal: { width: 816, height: 1344, label: "Legal" },
  };
  D.TEACHER_TEMPLATES = ["white", "presentation", "dark", "grid", "solid"];
  D.STUDENT_TEMPLATES = ["ruled", "narrow-ruled", "wide-ruled", "graph", "dotted", "math", "handwriting"];
  D.PAGE_TEMPLATES = {
    white: { mode: "teacher", template: "white", paperColor: "#ffffff", lineColor: "#d6d3d1", lineSpacing: 32, margin: 56, gridSize: 24 },
    presentation: { mode: "teacher", template: "presentation", paperColor: "#f1f5f9", lineColor: "#0f766e", lineSpacing: 32, margin: 0, gridSize: 24 },
    dark: { mode: "teacher", template: "dark", paperColor: "#24362b", lineColor: "#4d7c5a", lineSpacing: 32, margin: 0, gridSize: 32 },
    grid: { mode: "teacher", template: "grid", paperColor: "#ffffff", lineColor: "#e7e5e4", lineSpacing: 24, margin: 0, gridSize: 24 },
    solid: { mode: "teacher", template: "solid", paperColor: "#ffffff", lineColor: "#d6d3d1", lineSpacing: 32, margin: 56, gridSize: 24 },
    ruled: { mode: "student", template: "ruled", paperColor: "#fffef7", lineColor: "#93c5fd", lineSpacing: 32, margin: 64, gridSize: 24 },
    "narrow-ruled": { mode: "student", template: "narrow-ruled", paperColor: "#fffef7", lineColor: "#93c5fd", lineSpacing: 22, margin: 64, gridSize: 24 },
    "wide-ruled": { mode: "student", template: "wide-ruled", paperColor: "#fffef7", lineColor: "#7dd3fc", lineSpacing: 40, margin: 64, gridSize: 24 },
    graph: { mode: "student", template: "graph", paperColor: "#ffffff", lineColor: "#d6d3d1", lineSpacing: 20, margin: 0, gridSize: 20 },
    dotted: { mode: "student", template: "dotted", paperColor: "#ffffff", lineColor: "#a8a29e", lineSpacing: 24, margin: 0, gridSize: 24 },
    math: { mode: "student", template: "math", paperColor: "#f8fafc", lineColor: "#cbd5e1", lineSpacing: 16, margin: 0, gridSize: 16 },
    handwriting: { mode: "student", template: "handwriting", paperColor: "#fffef7", lineColor: "#7dd3fc", lineSpacing: 56, margin: 48, gridSize: 24 },
  };

  D.RIBBON_TABS = ["home", "draw", "insert", "view", "page", "export", "help"];

  D.LS_ACTIVE_BOARD_KEY = "drawora_active_board";
  D.DB_NAME = "drawora_boards";
  D.DB_STORE = "boards";
  D.DB_VERSION = 1;

  Object.assign(window, D);
})(window.Drawora = window.Drawora || {});
