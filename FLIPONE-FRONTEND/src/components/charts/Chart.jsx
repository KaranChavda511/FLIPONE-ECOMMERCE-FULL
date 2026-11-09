import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { echarts, RENDERER, THEME } from "./echarts";
import { ChartEmpty, ChartError, ChartSkeleton, ChartTable } from "./ChartStates";

/*
 * <Chart>: a thin React wrapper around one ECharts instance (theme 'flipone', SVG renderer).
 * Pages should render it through LazyChart.jsx so ECharts stays out of the main bundle.
 *
 * Props:
 *  option       ECharts option (use the builders in options.js). Applied with notMerge on every change,
 *               so memoise it (useMemo) to avoid redraws on unrelated renders.
 *  height       number (px) or CSS length. Default 280.
 *  ariaLabel    short name of the chart for screen readers ("Revenue and orders, last 30 days").
 *  summary      one or two sentences of what the chart shows (visually hidden; see dailySummary()).
 *  table        { caption, columns: [{ key, label, format }], rows }: visually hidden data table.
 *  loading      shows a Skeleton of the same height.
 *  error        truthy -> error state; `onRetry` adds the "Try again" button.
 *  empty        true -> EmptyState (use hasValues() from options.js); emptyTitle / emptyBody override copy.
 *  className    on the outer wrapper.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const subscribeReducedMotion = (onChange) => {
  const query = typeof window !== "undefined" && window.matchMedia ? window.matchMedia(REDUCED_MOTION) : null;
  query?.addEventListener?.("change", onChange);
  return () => query?.removeEventListener?.("change", onChange);
};
const getReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia ? window.matchMedia(REDUCED_MOTION).matches : false;
const getReducedMotionServer = () => false;

function ChartCanvas({ option, height, ariaLabel, describedBy }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionServer);

  // One instance per mount: init, follow the container's size, dispose on unmount.
  useEffect(() => {
    const el = containerRef.current;
    const chart = echarts.init(el, THEME, { renderer: RENDERER });
    chartRef.current = chart;

    let frame = 0;
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
              if (!chart.isDisposed()) chart.resize();
            });
          });
    observer?.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  // Replace the whole option on change; motion off when the viewer asks for reduced motion.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || chart.isDisposed() || !option) return;
    chart.setOption(reducedMotion ? { ...option, animation: false } : option, { notMerge: true });
  }, [option, reducedMotion]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      // Tabular figures in the SVG text, overriding the inline `font` ECharts writes.
      className="w-full [&_text]:[font-variant-numeric:tabular-nums_lining-nums]!"
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    />
  );
}

export default function Chart({
  option,
  height = 280,
  ariaLabel = "Chart",
  summary,
  table,
  loading = false,
  error = null,
  onRetry,
  empty = false,
  emptyTitle,
  emptyBody,
  className,
}) {
  const summaryId = `${useId()}-summary`;

  let body;
  if (loading) {
    body = <ChartSkeleton height={height} label={ariaLabel} />;
  } else if (error) {
    body = <ChartError height={height} onRetry={onRetry} />;
  } else if (empty || !option) {
    body = <ChartEmpty height={height} title={emptyTitle} body={emptyBody} />;
  } else {
    body = (
      <>
        <ChartCanvas option={option} height={height} ariaLabel={ariaLabel} describedBy={summary ? summaryId : undefined} />
        {summary && (
          <p id={summaryId} className="sr-only">
            {summary}
          </p>
        )}
        {table && <ChartTable caption={table.caption ?? ariaLabel} columns={table.columns} rows={table.rows} />}
      </>
    );
  }

  return (
    <div className={cn("relative min-w-0", className)} aria-busy={loading || undefined}>
      {body}
    </div>
  );
}
