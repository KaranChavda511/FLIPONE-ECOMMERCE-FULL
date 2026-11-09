import { describe, expect, it } from "vitest";
import { capitalize, formatDate, formatInr, formatNumber, shortId } from "./format";

describe("formatInr", () => {
  it("uses Indian digit grouping and no paise for whole rupees", () => {
    expect(formatInr(1299)).toBe("₹1,299");
    expect(formatInr(3842600)).toBe("₹38,42,600");
    expect(formatInr("2499")).toBe("₹2,499");
    expect(formatInr(0)).toBe("₹0");
  });

  it("shows two decimals for fractional amounts", () => {
    expect(formatInr(99.5)).toBe("₹99.50");
  });

  it("returns the fallback for missing or invalid values", () => {
    expect(formatInr(undefined)).toBe("—");
    expect(formatInr("abc")).toBe("—");
    expect(formatInr(null, { fallback: "" })).toBe("");
  });
});

describe("other helpers", () => {
  it("formats plain numbers en-IN", () => {
    expect(formatNumber(128400)).toBe("1,28,400");
  });

  it("formats dates as 9 Nov 2026", () => {
    expect(formatDate("2026-11-09T10:00:00Z")).toBe("9 Nov 2026");
    expect(formatDate("not a date")).toBe("—");
  });

  it("builds short order ids and capitalises", () => {
    expect(shortId("665f0c2a9b1e4d6f3a21")).toBe("#6F3A21");
    expect(capitalize("women")).toBe("Women");
  });
});
