import apiClient from "./apiClient";

// Cart API. The user token is attached by apiClient; errors propagate to the caller.

/** Cart items as returned by the API: { ItemId, product, requestedQuantity, availableQuantity, ... } */
const getCart = async () => {
  const { data } = await apiClient.get("/api/cart/view");
  return data.data?.items ?? [];
};

const addToCart = async (productId, quantity = 1) => {
  const { data } = await apiClient.post("/api/cart/addIn", { productId, quantity });
  return data;
};

const updateCart = async (itemId, quantity) => {
  const { data } = await apiClient.patch(`/api/cart/updateCart/${itemId}`, { quantity });
  return data;
};

const removeItem = async (itemId) => {
  const { data } = await apiClient.delete(`/api/cart/deleteItems/${itemId}`);
  return data;
};

const clearCart = async () => {
  await apiClient.delete("/api/cart/clear");
};

export default { getCart, addToCart, updateCart, removeItem, clearCart };
