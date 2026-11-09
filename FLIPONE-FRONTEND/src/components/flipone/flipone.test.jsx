import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Formik } from "formik";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthDialogProvider from "@/user/auth/AuthDialogProvider";
import {
  EmptyState,
  FormField,
  Mrp,
  PortalShell,
  Stamp,
  StatusMeterList,
  StoreFooter,
  StoreHeader,
  TagCard,
} from "./index";

afterEach(cleanup);

const makeStore = (state = {}) =>
  configureStore({
    reducer: {
      cart: (s = state.cart ?? { items: [] }) => s,
      auth: (s = state.auth ?? { user: null, token: null }) => s,
      seller: (s = state.seller ?? { sellerInfo: null }) => s,
      admin: (s = state.admin ?? { adminInfo: null }) => s,
    },
  });

const renderWith = (ui, { state, route = "/" } = {}) =>
  render(
    <Provider store={makeStore(state)}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={[route]}>
          <TooltipProvider>{ui}</TooltipProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );

const product = {
  _id: "665f0c2a9b1e4d6f3a21",
  name: "Classic Oxford Shirt",
  price: 1299,
  stock: 2,
  images: ["/uploads/shirt.png"],
  category: { name: "Men" },
  subcategories: ["Shirts"],
  seller: { name: "Acme Store" },
};

describe("Mrp and Stamp", () => {
  it("prints the MRP block with Indian grouping", () => {
    render(<Mrp value={3842600} />);
    expect(screen.getByText("₹38,42,600")).toBeTruthy();
    expect(screen.getByText("(incl. of all taxes)")).toBeTruthy();
  });

  it("maps backend statuses and low stock", () => {
    render(
      <>
        <Stamp status="delivered" />
        <Stamp variant="lowStock" count={3} />
      </>
    );
    expect(screen.getByText("delivered").closest("[data-variant]").dataset.variant).toBe("delivered");
    expect(screen.getByText("Only 3 left")).toBeTruthy();
  });
});

describe("TagCard", () => {
  it("renders the tag and calls onAdd / onToggleLike", () => {
    const onAdd = vi.fn();
    const onToggleLike = vi.fn();
    renderWith(<TagCard product={product} onAdd={onAdd} onToggleLike={onToggleLike} />);
    expect(screen.getByRole("link", { name: "Classic Oxford Shirt" }).getAttribute("href")).toBe(
      "/product/665f0c2a9b1e4d6f3a21"
    );
    expect(screen.getByText("Shirts")).toBeTruthy();
    expect(screen.getByText("Acme Store")).toBeTruthy();
    expect(screen.getByText("Only 2 left")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add Classic Oxford Shirt to cart" }));
    expect(onAdd).toHaveBeenCalledWith(product);
    fireEvent.click(screen.getByRole("button", { name: "Save Classic Oxford Shirt" }));
    expect(onToggleLike).toHaveBeenCalledWith(product);
  });

  it("hides Add when out of stock", () => {
    renderWith(<TagCard product={{ ...product, stock: 0 }} onAdd={() => {}} size="feature" />);
    expect(screen.queryByRole("button", { name: /add .* to cart/i })).toBeNull();
    expect(screen.getByText("Out of stock")).toBeTruthy();
    expect(screen.getByText("Men · Shirts")).toBeTruthy();
  });
});

describe("StoreHeader / StoreFooter", () => {
  it("shows the cart count, category links and calls onSearch", () => {
    const onSearch = vi.fn();
    renderWith(<StoreHeader categories={["women", "Men"]} onSearch={onSearch} />, {
      state: { cart: { items: [{ requestedQuantity: 2 }, { requestedQuantity: 1 }] } },
    });
    expect(screen.getByText(", 3 items")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Women" }).getAttribute("href")).toBe("/categories?category=women");
    expect(screen.getByRole("link", { name: "Log in" })).toBeTruthy();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: " dress " } });
    fireEvent.submit(screen.getByRole("search"));
    expect(onSearch).toHaveBeenCalledWith("dress");
  });

  it("footer has only real links", () => {
    renderWith(<StoreFooter />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(
      expect.arrayContaining(["/", "/selar_registrastion", "/contact", "/categories?category=Women"])
    );
  });
});

describe("PortalShell, EmptyState, FormField", () => {
  it("renders the seller shell with the active nav item", () => {
    renderWith(
      <PortalShell variant="seller" title="Orders">
        <p>content</p>
      </PortalShell>,
      { route: "/orders", state: { seller: { sellerInfo: { name: "Acme Store" } } } }
    );
    expect(screen.getByRole("heading", { level: 1, name: "Orders" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Orders" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "Log out" })).toBeTruthy();
  });

  it("renders an empty state", () => {
    render(<EmptyState illustration="orders" title="No orders yet" body="Orders you place show up here." />);
    expect(screen.getByRole("heading", { name: "No orders yet" })).toBeTruthy();
  });

  it("wires label, error and aria-describedby for Formik fields", () => {
    render(
      <Formik initialValues={{ email: "" }} initialErrors={{ email: "Enter your email" }} initialTouched={{ email: true }} onSubmit={() => {}}>
        <FormField name="email" label="Email" />
      </Formik>
    );
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(document.getElementById(describedBy).textContent).toContain("Enter your email");
  });
});

describe("StatusMeterList", () => {
  const counts = { pending: 3, shipped: 5, delivered: 26, cancelled: 1 };

  it("states the total with its cancelled qualifier and reads each row as one sentence", () => {
    render(<StatusMeterList title="Orders by status" counts={counts} unit="orders" qualifier="last 30 days" />);
    const region = screen.getByRole("region", { name: "Orders by status" });
    expect(region.textContent).toContain("35 orders · incl. 1 cancelled · last 30 days");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0].textContent).toContain("Pending: 3 orders, 9% of 35");
    expect(items[3].textContent).toContain("Cancelled: 1 order, 3% of 35");
    expect(items.map((li) => li.querySelector('[data-slot="stamp"]').dataset.variant)).toEqual([
      "pending",
      "shipped",
      "delivered",
      "cancelled",
    ]);
  });

  it("paints meters in status colours, never tag red, and copes with zero/invalid counts", () => {
    const { container } = render(<StatusMeterList counts={{ pending: "x", shipped: 0, delivered: 2 }} unit="items" />);
    expect(screen.getByRole("region", { name: "Items by status" }).textContent).toContain("2 items");
    expect(container.textContent).not.toContain("cancelled ·");
    const fills = [...container.querySelectorAll('[data-slot="status-meter-fill"]')];
    expect(fills).toHaveLength(1);
    expect(fills[0].className).toContain("bg-success");
    expect(container.innerHTML).not.toMatch(/bg-red|bg-primary|text-red/);
  });

  it("rows become toggle buttons when onSelect is given", () => {
    const onSelect = vi.fn();
    render(<StatusMeterList counts={counts} onSelect={onSelect} selected="shipped" />);
    const shipped = screen.getByRole("button", { name: /^Shipped: 5 orders/ });
    expect(shipped.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: /^Pending/ }));
    expect(onSelect).toHaveBeenCalledWith("pending");
  });
});

describe("PortalShell active nav", () => {
  it("marks the active item without any red marker", () => {
    renderWith(<PortalShell variant="admin" title="Dashboard" />, { route: "/admin" });
    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.className).not.toMatch(/red|after:/);
  });
});

describe("Shopper auth modal", () => {
  it("opens from the header and switches between log in and sign up", async () => {
    renderWith(
      <AuthDialogProvider>
        <StoreHeader categories={[]} />
      </AuthDialogProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByRole("heading", { name: "Log in to FlipOne" })).toBeTruthy();
    expect(screen.getByLabelText(/^Email/)).toBeTruthy();
    const signup = screen.getByRole("tab", { name: "Create account" });
    fireEvent.mouseDown(signup);
    expect(await screen.findByRole("heading", { name: "Create your account" })).toBeTruthy();
    expect(screen.getByLabelText(/^Mobile/)).toBeTruthy();
  });
});
