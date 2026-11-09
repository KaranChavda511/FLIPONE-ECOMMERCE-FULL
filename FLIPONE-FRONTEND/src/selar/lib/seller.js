import * as Yup from "yup";
import { capitalize } from "@/lib/format";

/*
 * Seller portal helpers shared by the products, update-product, orders and dashboard pages.
 * Plain functions and constants only (no React), so the component files stay refresh-friendly.
 */

/** Backend limit (Product.MAX_PRODUCT_IMAGES and the multer `files` limit). */
export const MAX_IMAGES = 5;
/** Backend limit on subcategories per product (Validation.js productSchemas: stringList({ max: 5 })). */
export const MAX_SUBCATEGORIES = 5;
/** Stock at or below this shows the ONLY N LEFT stamp (same default as TagCard). */
export const LOW_STOCK_AT = 5;
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

/** Same transitions the backend allows (sellerOrderController VALID_TRANSITIONS): one step forward. */
export const NEXT_STATUS = { pending: "shipped", shipped: "delivered" };
export const STATUS_STEPS = ["pending", "shipped", "delivered"];

/** Formik + Yup schema for the add and edit product forms. */
export const productSchema = Yup.object({
  name: Yup.string().trim().min(3, "At least 3 characters").max(150, "150 characters at most").required("Enter a product name"),
  description: Yup.string().trim().min(10, "At least 10 characters").max(2000, "2,000 characters at most").required("Describe the product"),
  price: Yup.number().typeError("Price must be a number").min(0, "Price cannot be negative").required("Enter the MRP"),
  stock: Yup.number()
    .typeError("Stock must be a number")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .required("Enter the stock"),
  category: Yup.string().required("Pick a category"),
  subcategories: Yup.array()
    .of(Yup.string())
    .min(1, "Pick at least one subcategory")
    .max(MAX_SUBCATEGORIES, `Pick up to ${MAX_SUBCATEGORIES} subcategories`),
});

export const emptyProduct = { name: "", description: "", price: "", stock: "", category: "", subcategories: [] };

/** Multipart body for POST /api/seller/add-product and PATCH /api/seller/products/:id. */
export const productFormData = (values, files = []) => {
  const formData = new FormData();
  ["name", "description", "price", "stock", "category"].forEach((key) => formData.append(key, values[key]));
  formData.append("subcategories", JSON.stringify(values.subcategories ?? []));
  files.forEach((file) => formData.append("images", file));
  return formData;
};

/** GET /api/product/categories returns a bare array of { _id, name, subcategories[] }. */
export const categoryList = (data) => (Array.isArray(data) ? data : []);

export const categoryOptions = (categories) => categories.map((c) => ({ value: c.name, label: capitalize(c.name) }));

/** Subcategories of a category, lower-cased to match what the backend stores. */
export const subcategoriesOf = (categories, categoryName) => {
  const subs = categories.find((c) => c.name === categoryName)?.subcategories ?? [];
  return [...new Set(subs.map((s) => String(s).toLowerCase()))];
};

/** "Women · Dresses" */
export const categoryLabel = (category, subcategories) => {
  const sub = Array.isArray(subcategories) ? subcategories[0] : subcategories;
  return [category, sub].filter(Boolean).map(capitalize).join(" · ");
};

/** 'out' | 'low' | 'ok' */
export const stockLevel = (stock) => {
  const n = Number(stock);
  if (!Number.isFinite(n) || n <= 0) return "out";
  return n <= LOW_STOCK_AT ? "low" : "ok";
};

/**
 * GET /api/seller/allOrders returns orders with this seller's items nested. The portal works per item,
 * so flatten them into rows that keep their order's id, date, customer and city.
 */
export const flattenOrderItems = (orders = []) =>
  orders.flatMap((order) =>
    (order.items ?? []).map((item) => ({
      ...item,
      orderId: order.orderId,
      date: order.date,
      customer: order.user,
      city: order.shippingAddress?.city,
    }))
  );

/** Rupee amount of one order item line (unit price x quantity). */
export const lineAmount = (item) => (Number(item.price) || 0) * (Number(item.quantity) || 0);

/** Stagger delay for list/table entrance: 30ms per item, capped so the whole list lands within 250ms. */
export const staggerDelay = (index) => Math.min(index, 8) * 0.03;

/** GET /api/seller/analytics: the seller's own figures. `days` (7-365) sizes the daily window. */
export const ANALYTICS_URL = "/api/seller/analytics";

/** Order item statuses as SegmentBar segments, in pipeline order (colours match the Stamp kit). */
export const statusSegments = (counts) => [
  { key: "pending", label: "Pending", value: counts?.pending ?? 0, swatch: "bg-warning" },
  { key: "shipped", label: "Shipped", value: counts?.shipped ?? 0, swatch: "bg-ink" },
  { key: "delivered", label: "Delivered", value: counts?.delivered ?? 0, swatch: "bg-success" },
  { key: "cancelled", label: "Cancelled", value: counts?.cancelled ?? 0, swatch: "bg-danger" },
];

/**
 * Active products split into in stock / low / out (the API counts low and out among active products only,
 * so the three parts add up to `active`).
 */
export const inventorySegments = (products, threshold) => {
  const active = Number(products?.active) || 0;
  const low = Number(products?.lowStock) || 0;
  const out = Number(products?.outOfStock) || 0;
  return [
    { key: "ok", label: `More than ${threshold} left`, value: Math.max(0, active - low - out), swatch: "bg-ink" },
    { key: "low", label: `Low (1 to ${threshold})`, value: low, swatch: "bg-warning" },
    { key: "out", label: "Out of stock", value: out, swatch: "bg-danger" },
  ];
};
