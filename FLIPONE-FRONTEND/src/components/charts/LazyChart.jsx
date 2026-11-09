import { Component, lazy, Suspense } from "react";
import { ChartError, ChartSkeleton } from "./ChartStates";

/*
 * <LazyChart>: same props as Chart.jsx. Chart.jsx (and ECharts with it) is a separate chunk that is only
 * requested when a LazyChart first renders, i.e. on dashboard routes. A Skeleton of the same height holds
 * the space meanwhile, so nothing shifts when the chart arrives.
 */
const Chart = lazy(() => import("./Chart.jsx"));

/* The chunk can fail to download (offline, a deploy replaced it): offer a reload instead of a blank box. */
class ChartChunkBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <ChartError
          height={this.props.height}
          className={this.props.className}
          title="This chart could not load"
          body="Reload the page to fetch it again."
          retryLabel="Reload page"
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}

export default function LazyChart(props) {
  const height = props.height ?? 280;
  return (
    <ChartChunkBoundary height={height} className={props.className}>
      <Suspense fallback={<ChartSkeleton height={height} label={props.ariaLabel} className={props.className} />}>
        <Chart {...props} />
      </Suspense>
    </ChartChunkBoundary>
  );
}
