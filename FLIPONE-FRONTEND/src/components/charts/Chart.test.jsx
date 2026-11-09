import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Chart from "./Chart.jsx";
import LazyChart from "./LazyChart.jsx";
import { fliponeTheme } from "./echarts";
import { revenueOrdersCombo, TABLE_COLUMNS } from "./options";

afterEach(cleanup);

// jsdom has no canvas; ECharts then estimates text widths itself (no console noise).
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

const daily = [
  { date: "2026-11-08", revenue: 125000, orders: 4 },
  { date: "2026-11-09", revenue: 3299, orders: 1 },
];

describe("Chart states", () => {
  it("shows a skeleton while loading", () => {
    const { container } = render(<Chart loading ariaLabel="Revenue" height={200} />);
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    expect(screen.getByText("Loading Revenue")).toBeTruthy();
    expect(container.firstChild.getAttribute("aria-busy")).toBe("true");
  });

  it("shows the empty state", () => {
    render(<Chart empty emptyTitle="No sales in the last 30 days" />);
    expect(screen.getByText("No sales in the last 30 days")).toBeTruthy();
  });

  it("shows the error with a working retry", () => {
    const onRetry = vi.fn();
    render(<Chart error={new Error("Network Error")} onRetry={onRetry} />);
    expect(screen.getByText("Could not load these figures")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders an image role with summary and a hidden data table", () => {
    render(
      <Chart
        option={revenueOrdersCombo(daily)}
        ariaLabel="Revenue and orders"
        summary="Revenue over 2 days: total ₹1,28,299."
        table={{ columns: TABLE_COLUMNS.revenueOrders, rows: daily }}
      />
    );
    const img = screen.getByRole("img", { name: "Revenue and orders" });
    const summaryId = img.getAttribute("aria-describedby");
    expect(document.getElementById(summaryId).textContent).toBe("Revenue over 2 days: total ₹1,28,299.");
    const table = screen.getByRole("table", { name: "Revenue and orders" });
    expect(table.textContent).toContain("Sun, 8 Nov 2026");
    expect(table.textContent).toContain("₹1,25,000");
  });
});

describe("LazyChart", () => {
  it("renders the skeleton until the chunk arrives, then the chart", async () => {
    render(<LazyChart option={revenueOrdersCombo(daily)} ariaLabel="Revenue and orders" />);
    expect(screen.getByText("Loading Revenue and orders")).toBeTruthy();
    expect(await screen.findByRole("img", { name: "Revenue and orders" })).toBeTruthy();
  });
});

describe("flipone theme", () => {
  it("follows the token order and styling", () => {
    expect(fliponeTheme.color).toEqual(["#17150F", "#8A857B", "#A8875A", "#1E7445", "#A15C00", "#5C584F"]);
    expect(fliponeTheme.valueAxis.splitLine.lineStyle.color).toBe("#E6E3DC");
    expect(fliponeTheme.valueAxis.axisLabel.color).toBe("#5C584F");
    expect(fliponeTheme.valueAxis.axisLabel.fontFamily).toMatch(/^"Barlow Condensed"/);
    expect(fliponeTheme.tooltip).toMatchObject({ backgroundColor: "#FFFFFF", borderWidth: 1 });
    expect(fliponeTheme.textStyle.fontFamily).toMatch(/^"Work Sans"/);
  });
});
