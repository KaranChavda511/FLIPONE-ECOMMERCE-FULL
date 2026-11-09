/*
 * ECharts, tree-shaken: only the charts and components FlipOne dashboards use are registered, plus the
 * 'flipone' theme. Import this module only from Chart.jsx (itself lazy-loaded through LazyChart.jsx), so
 * ECharts lands in its own chunk and is downloaded on dashboard routes only.
 *
 * Need another series type or component? Register it here (e.g. MarkLineComponent from
 * 'echarts/components') and nowhere else.
 */
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import { DatasetComponent, GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import { COLORS, FONT_NUM, FONT_SANS, SERIES_COLORS } from "./tokens";

echarts.use([BarChart, LineChart, PieChart, DatasetComponent, GridComponent, LegendComponent, TooltipComponent, SVGRenderer]);

/* SVG keeps text and 1px rules crisp at any zoom; dashboards draw tens of marks, not tens of thousands. */
export const RENDERER = "svg";
export const THEME = "flipone";

const axisLabel = { color: COLORS.muted, fontFamily: FONT_NUM, fontSize: 13, fontWeight: 500, margin: 10 };
const axisName = { color: COLORS.muted, fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500 };

const categoryAxis = {
  axisLine: { show: true, lineStyle: { color: COLORS.axis, width: 1 } },
  axisTick: { show: false },
  axisLabel,
  splitLine: { show: false },
  splitArea: { show: false },
  nameTextStyle: axisName,
};

const valueAxis = {
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel,
  splitLine: { show: true, lineStyle: { color: COLORS.grid, width: 1, type: "solid" } },
  splitArea: { show: false },
  nameTextStyle: axisName,
};

/** The FlipOne theme: tokens from src/index.css. Builders in options.js only add what is chart-specific. */
export const fliponeTheme = {
  color: SERIES_COLORS,
  backgroundColor: "transparent",
  textStyle: { fontFamily: FONT_SANS, color: COLORS.ink },
  categoryAxis,
  valueAxis,
  timeAxis: categoryAxis,
  logAxis: valueAxis,
  legend: {
    icon: "rect",
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 18,
    textStyle: { color: COLORS.muted, fontFamily: FONT_SANS, fontSize: 13 },
    inactiveColor: COLORS.border,
  },
  tooltip: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: COLORS.ink, fontFamily: FONT_SANS, fontSize: 13 },
    /* the system's only shadow (shadow-tag, blur <= 12px); no glow */
    extraCssText:
      "border-radius:6px;box-shadow:0 1px 2px rgb(23 21 15 / 0.06),0 4px 12px -4px rgb(23 21 15 / 0.16);",
    axisPointer: {
      lineStyle: { color: COLORS.axis, width: 1 },
      crossStyle: { color: COLORS.axis, width: 1 },
      shadowStyle: { color: "rgba(23, 21, 15, 0.05)" },
    },
  },
  line: {
    lineStyle: { width: 2 },
    symbol: "circle",
    symbolSize: 6,
    smooth: false,
  },
  bar: {
    itemStyle: { borderWidth: 0 },
  },
  pie: {
    itemStyle: { borderColor: COLORS.surface, borderWidth: 2 },
  },
};

echarts.registerTheme(THEME, fliponeTheme);

export { echarts };
