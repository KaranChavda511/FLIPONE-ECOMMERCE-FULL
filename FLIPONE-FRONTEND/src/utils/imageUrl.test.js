import { describe, expect, it } from "vitest";
import { imageUrl, PLACEHOLDER_IMAGE } from "./imageUrl";

describe("imageUrl", () => {
  const base = "http://localhost:5000";

  it("prefixes relative upload paths with the API base", () => {
    expect(imageUrl("/uploads/a.png", base)).toBe("http://localhost:5000/uploads/a.png");
    expect(imageUrl("uploads/a.png", `${base}/`)).toBe("http://localhost:5000/uploads/a.png");
  });

  it("takes the first entry of an array", () => {
    expect(imageUrl(["/uploads/a.png", "/uploads/b.png"], base)).toBe(
      "http://localhost:5000/uploads/a.png"
    );
  });

  it("passes absolute, blob and data URLs through", () => {
    expect(imageUrl("https://cdn.example.com/x.jpg", base)).toBe("https://cdn.example.com/x.jpg");
    expect(imageUrl("blob:http://localhost/123", base)).toBe("blob:http://localhost/123");
  });

  it("falls back to the placeholder for empty values", () => {
    expect(imageUrl(undefined, base)).toBe(PLACEHOLDER_IMAGE);
    expect(imageUrl([], base)).toBe(PLACEHOLDER_IMAGE);
    expect(imageUrl("", base, "/x.svg")).toBe("/x.svg");
  });
});
