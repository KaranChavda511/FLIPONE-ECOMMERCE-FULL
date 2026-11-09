import { describe, expect, it } from "vitest";
import { roleForUrl, selectToken } from "./apiClient";

describe("roleForUrl", () => {
  it("maps API paths to the session that owns them", () => {
    expect(roleForUrl("/api/admin/allUsers")).toBe("admin");
    expect(roleForUrl("/api/seller/products")).toBe("seller");
    expect(roleForUrl("/api/cart/view")).toBe("user");
    expect(roleForUrl("/api/product/search")).toBe("user");
    expect(roleForUrl("http://localhost:5000/api/admin/analytics/sales")).toBe("admin");
  });
});

describe("selectToken", () => {
  const state = {
    auth: { token: "user-t" },
    seller: { sellerInfo: { token: "seller-t" } },
    admin: { adminInfo: { token: "admin-t" } },
  };

  it("reads the token of the requested role", () => {
    expect(selectToken(state, "user")).toBe("user-t");
    expect(selectToken(state, "seller")).toBe("seller-t");
    expect(selectToken(state, "admin")).toBe("admin-t");
  });

  it("returns null when that session is logged out", () => {
    expect(selectToken({ auth: { token: null }, seller: { sellerInfo: null } }, "seller")).toBeNull();
    expect(selectToken(undefined, "user")).toBeNull();
  });
});

describe("apiErrorMessage", () => {
  it("prefers the API message, names unreachable servers, else falls back", async () => {
    const { apiErrorMessage, NETWORK_ERROR_MESSAGE } = await import("./apiClient");
    expect(apiErrorMessage({ response: { data: { message: "Invalid email or password" } } }, "x")).toBe(
      "Invalid email or password"
    );
    expect(apiErrorMessage({ isAxiosError: true, request: {} }, "Login failed")).toBe(NETWORK_ERROR_MESSAGE);
    expect(apiErrorMessage(new Error("boom"), "Login failed")).toBe("Login failed");
  });
});
