import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// 🔐 Auth header builder
const authHeader = (token) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
  withCredentials: true,
});

const getCart = async (token) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/cart/view`, authHeader(token));
    console.log("Cart items fetched:", res.data.data?.items); // log cart items
    return res.data.data?.items || []; // Return empty array if no items
  } catch (error) {
    console.error("Error fetching cart:", error.response?.data || error.message);
    return []; // Return empty array in case of an error
  }
};

// const addToCart = async (item, token) => {
  
//   try {
//     const res = await axios.post(
//       `${BASE_URL}/api/cart/addIn`,
//       { productId: item._id, quantity: 1 },
//       authHeader(token)
//     );
//     console.log("Item added to cart:", res.data);
//     return res.data;
//   } catch (error) {
//     console.error("Error adding item to cart:", error.response?.data || error.message);
//     throw error; // Throw the error for higher level handling
//   }
// };

const addToCart = async (item, token) => {
  try {
    const availableQuantity = item.availableQuantity || 0; // Get available stock
    const requestedQuantity = 1; // You can modify this if needed

    if (requestedQuantity > availableQuantity) {
      // Show a message or handle the error in UI
      alert(`Only ${availableQuantity} items available in stock.`);
      return; // Stop further execution
    }

    const res = await axios.post(
      `${BASE_URL}/api/cart/addIn`,
      { productId: item._id, quantity: requestedQuantity },
      authHeader(token)
    );

    if (res.data.success) {
      console.log("Item added to cart:", res.data);
    } else {
      console.error("Error adding item to cart:", res.data.error || "Unknown error");
      alert("Error adding item to cart: " + res.data.message); // Show error message to user
    }

    return res.data;
  } catch (error) {
    console.error("Error adding item to cart:", error.response?.data || error.message);
    alert("An error occurred while adding the item to the cart.");
    throw error;
  }
};
const updateCart = async (itemId, newQuantity, token) => {
  console.log("Updating cart with:", itemId, newQuantity);
  try {
    const res = await axios.patch(
      `${BASE_URL}/api/cart/updateCart/${itemId}`,
      { quantity: newQuantity },
      authHeader(token)
    );
    console.log("Cart updated:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error updating cart:", error.response?.data || error.message);
    throw error; // Throw the error for higher level handling
  }
};

const clearCart = async (token) => {
  try {
    await axios.delete(`${BASE_URL}/api/cart/clear`, authHeader(token));
    console.log("Cart cleared successfully");
  } catch (error) {
    console.error("Error clearing cart:", error.response?.data || error.message);
  }
};

export default { getCart, addToCart, updateCart, clearCart };
