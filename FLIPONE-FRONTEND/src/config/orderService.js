import apiClient from "./apiClient";

/** shippingAddress: { street, city, state, postalCode }; shippingMethod: "flat" | "pickup" (the server sets the fee). */
export const createOrder = async (shippingAddress, shippingMethod = "flat") => {
  const { data } = await apiClient.post("/api/order/checkout", { shippingAddress, shippingMethod });
  return data;
};

export const getOrderHistory = async () => {
  const { data } = await apiClient.get("/api/order/orderHistory");
  return data;
};
