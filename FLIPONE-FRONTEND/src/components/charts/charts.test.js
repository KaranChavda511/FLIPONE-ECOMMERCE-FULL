import { describe, expect, it } from "vitest";
import { compactInr, compactNumber, count, escapeHtml, inr, longDate, percent, shortDate } from "./formatters";
import {
  barListHeight,
  categoryBars,
  dailySummary,
  fieldLabel,
  hasValues,
  rankSummary,
  revenueOrdersCombo,
  signupLines,
  statusDonut,
  statusRows,
  statusSummary,
  topList,
  unitsArea,
} from "./options";
import { COLORS, STATUS_COLORS } from "./tokens";

const daily = [
  { date: "2026-11-07", revenue: 0, units: 0, orders: 0 },
  { date: "2026-11-08", revenue: 125000, units: 9, orders: 4 },
  { date: "2026-11-09", revenue: 3299.5, units: 2, orders: 1 },
];

/* ---------- formatters ---------- */

describe("formatters", () => {
  it("inr uses Indian digit grouping", () => {
    expect(inr(1299)).toBe("₹1,299");
    expect(inr(3842600)).toBe("₹38,42,600");
    expect(inr(99.5)).toBe("₹99.50");
    expect(inr(null)).toBe("—");
    expect(inr("abc")).toBe("—");
  });

  it("count groups en-IN", () => {
    expect(count(128400)).toBe("1,28,400");
  });

  it("compactNumber uses K, lakh and crore", () => {
    expect(compactNumber(0)).toBe("0");
    expect(compactNumber(950)).toBe("950");
    expect(compactNumber(4500)).toBe("4.5K");
    expect(compactNumber(45000)).toBe("45K");
    expect(compactNumber(120000)).toBe("1.2L");
    expect(compactNumber(2500000)).toBe("25L");
    expect(compactNumber(34000000)).toBe("3.4Cr");
    expect(compactNumber(12345000000)).toBe("1,234.5Cr");
    expect(compactNumber(-45000)).toBe("-45K");
    expect(compactNumber(undefined)).toBe("—");
  });

  it("compactNumber promotes values that round into the next unit", () => {
    expect(compactNumber(999.6)).toBe("1K");
    expect(compactNumber(99950)).toBe("1L");
    expect(compactNumber(9999999)).toBe("1Cr");
  });

  it("compactInr prefixes the rupee sign", () => {
    expect(compactInr(0)).toBe("₹0");
    expect(compactInr(45000)).toBe("₹45K");
    expect(compactInr(120000)).toBe("₹1.2L");
    expect(compactInr(34000000)).toBe("₹3.4Cr");
    expect(compactInr(-1500)).toBe("-₹1.5K");
    expect(compactInr("x")).toBe("—");
  });

  it("shortDate and longDate read YYYY-MM-DD as a calendar day", () => {
    expect(shortDate("2026-11-09")).toBe("9 Nov");
    expect(shortDate("2026-01-01")).toBe("1 Jan");
    expect(longDate("2026-11-09")).toBe("Mon, 9 Nov 2026");
    expect(shortDate("not a date")).toBe("not a date");
    expect(shortDate(undefined)).toBe("");
  });

  it("percent and escapeHtml", () => {
    expect(percent(0.314)).toBe("31%");
    expect(percent(NaN)).toBe("—");
    expect(escapeHtml(`<b onclick="x">Tom & 'Jerry'</b>`)).toBe(
      "&lt;b onclick=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/b&gt;"
    );
  });
});

/* ---------- builders ---------- */

const json = (value) => JSON.parse(JSON.stringify(value));

const assertNoDecoration = (option) => {
  const text = JSON.stringify(option);
  expect(text).not.toMatch(/linear|radial|gradient/i);
  expect(text).not.toMatch(/shadowBlur/);
};

describe("revenueOrdersCombo", () => {
  const option = revenueOrdersCombo(daily);

  it("draws only the ink revenue bars; orders and units are not drawn", () => {
    expect(option.dataset.source).toEqual([
      { date: "2026-11-07", revenue: 0, orders: 0, units: 0 },
      { date: "2026-11-08", revenue: 125000, orders: 4, units: 9 },
      { date: "2026-11-09", revenue: 3299.5, orders: 1, units: 2 },
    ]);
    expect(option.series).toHaveLength(1);
    expect(option.series[0]).toMatchObject({ id: "revenue", type: "bar", encode: { x: "date", y: "revenue" } });
    expect(option.series[0].itemStyle.color).toBe(COLORS.ink);
    expect(option.series.some((s) => s.type === "line")).toBe(false);
    expect(option.yAxis).toHaveLength(1);
    expect(option.legend).toBeUndefined();
    assertNoDecoration(json(option));
  });

  it("formats axes and tooltip in rupees, with orders and units per day in the tooltip", () => {
    expect(option.xAxis.axisLabel.formatter("2026-11-09")).toBe("9 Nov");
    expect(option.yAxis[0].axisLabel.formatter(150000)).toBe("₹1.5L");
    const html = option.tooltip.formatter([
      { axisValue: "2026-11-08", seriesId: "revenue", seriesName: "Revenue", color: COLORS.ink, value: option.dataset.source[1], dataIndex: 1 },
    ]);
    expect(html).toContain("Sun, 8 Nov 2026");
    expect(html).toContain("₹1,25,000");
    expect(html).toMatch(/Orders.*>4</);
    expect(html).toMatch(/Units sold.*>9</);
    expect(html).not.toContain(COLORS.red);
    // Falls back to the dataset row when ECharts passes no row object.
    expect(option.tooltip.formatter({ axisValue: "2026-11-09", dataIndex: 2, value: 3299.5 })).toMatch(/Orders.*>1</);
  });

  it("leaves the units row out when the rows have no units", () => {
    const noUnits = revenueOrdersCombo([{ date: "2026-11-09", revenue: 500, orders: 2 }], { ordersLabel: "Order items" });
    expect(noUnits.dataset.dimensions).toEqual(["date", "revenue", "orders"]);
    const html = noUnits.tooltip.formatter([{ axisValue: "2026-11-09", value: noUnits.dataset.source[0] }]);
    expect(html).toMatch(/Order items.*>2</);
    expect(html).not.toContain("Units sold");
  });

  it("copes with missing or bad input", () => {
    expect(revenueOrdersCombo(undefined).dataset.source).toEqual([]);
    expect(revenueOrdersCombo([{ date: "2026-11-09", revenue: "12", orders: null }]).dataset.source).toEqual([
      { date: "2026-11-09", revenue: 12, orders: 0 },
    ]);
    expect(revenueOrdersCombo([]).tooltip.formatter([])).toBe("");
  });
});

describe("statusDonut", () => {
  const counts = { pending: 3, shipped: 5, delivered: 10, cancelled: 2 };
  const option = statusDonut(counts);
  const [donut, total] = option.series;

  it("uses the stamp colours in pending, shipped, delivered, cancelled order", () => {
    expect(donut.data.map((d) => [d.name, d.value, d.itemStyle.color])).toEqual([
      ["Pending", 3, STATUS_COLORS.pending],
      ["Shipped", 5, STATUS_COLORS.shipped],
      ["Delivered", 10, STATUS_COLORS.delivered],
      ["Cancelled", 2, STATUS_COLORS.cancelled],
    ]);
    expect(STATUS_COLORS).toEqual({ pending: "#A15C00", shipped: "#17150F", delivered: "#1E7445", cancelled: "#9E1B32" });
  });

  it("puts the total in the centre and keeps the helper series out of legend and tooltip", () => {
    expect(total.label.formatter).toBe("{v|20}\n{u|orders}");
    expect(total.silent).toBe(true);
    expect(total.tooltip.show).toBe(false);
    expect(option.legend.data).toEqual(["Pending", "Shipped", "Delivered", "Cancelled"]);
    expect(statusDonut(counts, { unit: "items" }).series[1].label.formatter).toBe("{v|20}\n{u|items}");
  });

  it("labels the legend with counts and shares", () => {
    expect(option.legend.formatter("Delivered")).toBe("{n|Delivered}{v|10}{p|50%}");
    expect(option.tooltip.formatter({ name: "Shipped", value: 5 })).toMatch(/Shipped.*5.*25%/s);
  });

  it("keeps the legend on the right by default and can stack it under the donut", () => {
    expect(donut.center).toEqual(["30%", "50%"]);
    expect(option.legend).toMatchObject({ orient: "vertical", right: 0, top: "middle" });
    const stacked = statusDonut(counts, { legend: "bottom" });
    expect(stacked.series[0].center).toEqual(["50%", "36%"]);
    expect(stacked.series[1].center).toEqual(stacked.series[0].center);
    expect(stacked.legend).toMatchObject({ orient: "vertical", left: "center", bottom: 0 });
    expect(stacked.legend.right).toBeUndefined();
    expect(stacked.legend.formatter("Delivered")).toBe("{n|Delivered}{v|10}{p|50%}");
  });

  it("treats missing counts as zero", () => {
    const empty = statusDonut(null);
    expect(empty.series[0].data.every((d) => d.value === 0)).toBe(true);
    expect(empty.legend.formatter("Pending")).toBe("{n|Pending}{v|0}{p|—}");
  });
});

describe("categoryBars and topList", () => {
  const categories = [
    { category: "Men", revenue: 41500, units: 12 },
    { category: "Women", revenue: 82000, units: 30 },
    { category: "Bags", revenue: 9900, units: 3 },
  ];

  it("sorts categories largest first with rupee direct labels", () => {
    const option = categoryBars(categories);
    expect(option.yAxis.data).toEqual(["Women", "Men", "Bags"]);
    expect(option.yAxis.inverse).toBe(true);
    expect(option.series[0].data).toEqual([82000, 41500, 9900]);
    expect(option.series[0].label.formatter({ value: 82000 })).toBe("₹82,000");
    expect(option.xAxis.show).toBe(false);
    assertNoDecoration(json(option));
  });

  it("ranks by units with plain counts", () => {
    const option = categoryBars(categories, { valueKey: "units" });
    expect(option.series[0].data).toEqual([30, 12, 3]);
    expect(option.series[0].label.formatter({ value: 30 })).toBe("30");
  });

  it("escapes names in the tooltip and adds the other known fields", () => {
    const option = categoryBars([{ category: "<script>", revenue: 10, units: 1 }]);
    const html = option.tooltip.formatter([{ dataIndex: 0 }]);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("Units sold");
  });

  it("topList keeps the top N and finds the label field", () => {
    const sellers = Array.from({ length: 12 }, (_, i) => ({
      sellerName: `Shop ${i + 1}`,
      totalRevenue: (i + 1) * 1000,
      totalQuantitySold: i,
      orderCount: i + 2,
    }));
    const option = topList(sellers, "totalRevenue");
    expect(option.yAxis.data).toHaveLength(10);
    expect(option.yAxis.data[0]).toBe("Shop 12");
    expect(option.series[0].name).toBe("Revenue");
    const html = option.tooltip.formatter([{ dataIndex: 0 }]);
    expect(html).toContain("₹12,000");
    expect(html).toContain("Units sold");
    expect(html).toContain("Orders");

    const byUnits = topList(sellers, "totalQuantitySold", { limit: 3 });
    expect(byUnits.series[0].data).toEqual([11, 10, 9]);
    expect(byUnits.series[0].label.formatter({ value: 11 })).toBe("11");
  });

  it("labels blank names as Other", () => {
    expect(topList([{ name: "  ", totalRevenue: 5 }]).yAxis.data).toEqual(["Other"]);
  });
});

describe("signupLines and unitsArea", () => {
  it("signupLines draws daily bars (shoppers ink, sellers grey) with a top-left legend", () => {
    const option = signupLines([{ date: "2026-11-09", users: 4, sellers: 1 }]);
    expect(option.legend).toMatchObject({ top: 0, left: 0, data: ["Shoppers", "Sellers"] });
    expect(option.series.map((s) => [s.name, s.type, s.itemStyle.color])).toEqual([
      ["Shoppers", "bar", COLORS.ink],
      ["Sellers", "bar", "#8A857B"],
    ]);
    expect(option.series.every((s) => s.endLabel === undefined && s.lineStyle === undefined)).toBe(true);
    expect(option.yAxis.minInterval).toBe(1);
    expect(option.yAxis.max({ min: 0, max: 0 })).toBe(1);
    expect(option.yAxis.max({ min: 0, max: 3.2 })).toBe(4);
    assertNoDecoration(json(option));
  });

  it("no builder paints a series in tag red", () => {
    const counts = { pending: 1, shipped: 1, delivered: 1, cancelled: 1 };
    const options = [
      revenueOrdersCombo(daily),
      signupLines([{ date: "2026-11-09", users: 4, sellers: 1 }]),
      statusDonut(counts),
      categoryBars([{ category: "Men", revenue: 1, units: 1 }]),
      topList([{ name: "A", totalRevenue: 1 }]),
      unitsArea(daily),
    ];
    for (const option of options) expect(JSON.stringify(option).toUpperCase()).not.toContain(COLORS.red);
  });

  it("unitsArea fills a solid 8% area, never a gradient", () => {
    const option = unitsArea(daily);
    expect(option.series[0].areaStyle).toEqual({ color: COLORS.ink, opacity: 0.08 });
    expect(option.dataset.source.map((r) => r.units)).toEqual([0, 9, 2]);
    assertNoDecoration(json(option));
    const money = unitsArea(daily, { key: "revenue" });
    expect(money.yAxis.axisLabel.formatter(120000)).toBe("₹1.2L");
    expect(money.series[0].name).toBe("Revenue");
  });
});

/* ---------- helpers ---------- */

describe("helpers", () => {
  it("hasValues spots all-zero data", () => {
    expect(hasValues(daily, ["revenue"])).toBe(true);
    expect(hasValues([{ revenue: 0 }, { revenue: 0 }], ["revenue"])).toBe(false);
    expect(hasValues({ pending: 0, shipped: 0 })).toBe(false);
    expect(hasValues({ pending: 0, shipped: 2 })).toBe(true);
    expect(hasValues(undefined, ["x"])).toBe(false);
  });

  it("summaries use only the figures passed in", () => {
    expect(dailySummary(daily, { key: "revenue" })).toBe(
      "Revenue over 3 days: total ₹1,28,299.50. Highest on Sun, 8 Nov 2026 at ₹1,25,000."
    );
    expect(dailySummary([{ date: "2026-11-09", orders: 0 }], { key: "orders" })).toBe("Orders over 1 day: none.");
    expect(dailySummary([], { key: "orders" })).toBe("Orders: no data.");
    expect(statusSummary({ pending: 3, shipped: 5 })).toBe("8 orders: 3 pending, 5 shipped, 0 delivered, 0 cancelled.");
    expect(
      rankSummary(
        [
          { category: "Men", revenue: 41500 },
          { category: "Women", revenue: 82000 },
        ],
        { valueKey: "revenue", top: 1 }
      )
    ).toBe("Top: Women ₹82,000 (2 in all).");
  });

  it("statusRows, fieldLabel, barListHeight", () => {
    expect(statusRows({ shipped: 2 })).toEqual([
      { status: "Pending", count: 0 },
      { status: "Shipped", count: 2 },
      { status: "Delivered", count: 0 },
      { status: "Cancelled", count: 0 },
    ]);
    expect(fieldLabel("totalQuantitySold")).toBe("Units sold");
    expect(fieldLabel("stockLeft")).toBe("StockLeft");
    expect(barListHeight(2)).toBe(120);
    expect(barListHeight(10)).toBe(356);
  });
});
