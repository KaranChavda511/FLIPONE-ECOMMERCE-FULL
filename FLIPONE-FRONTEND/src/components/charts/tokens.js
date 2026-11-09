/*
 * Chart tokens: the swing-tag palette (src/index.css) as plain values, because ECharts paints SVG/canvas
 * and cannot read CSS variables. No ECharts import here, so option builders and tests stay light.
 */

export const COLORS = {
  ink: "#17150F",
  inkSoft: "#3B372F",
  red: "#D3261C",
  kraft: "#CDAE80",
  /* Kraft deep enough for marks and lines on white (3.3:1, WCAG 1.4.11). Plain #CDAE80 is 1.9:1. */
  kraftDark: "#A8875A",
  success: "#1E7445",
  warning: "#A15C00",
  danger: "#9E1B32",
  muted: "#5C584F",
  /* Second series beside ink (sellers next to shoppers): the control-line grey, 3.7:1 on white. */
  secondary: "#8A857B",
  /* control line: thin axis rules (3.7:1 on white) */
  axis: "#8A857B",
  grid: "#E6E3DC",
  border: "#DEDCD6",
  surface: "#FFFFFF",
  paper: "#F5F4F0",
};

/**
 * Series colours, in order: ink, grey, kraft, success, warning, muted. Tag red is never a series colour:
 * it is reserved for actions and MRP figures (COLORS.red stays exported, but not for chart marks).
 */
export const SERIES_COLORS = [
  COLORS.ink,
  COLORS.secondary,
  COLORS.kraftDark,
  COLORS.success,
  COLORS.warning,
  COLORS.muted,
];

/** Order status colours, matching the Stamp kit. */
export const STATUS_COLORS = {
  pending: COLORS.warning,
  shipped: COLORS.ink,
  delivered: COLORS.success,
  cancelled: COLORS.danger,
};

export const FONT_SANS = '"Work Sans", ui-sans-serif, system-ui, sans-serif';
export const FONT_NUM = '"Barlow Condensed", "Work Sans", ui-sans-serif, sans-serif';
