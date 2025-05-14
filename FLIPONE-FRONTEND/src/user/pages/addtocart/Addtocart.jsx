import React, { useEffect, useState } from "react";
import {
  Box, Typography, CardMedia, IconButton, Button, Divider,
  Radio, RadioGroup, FormControlLabel, TextField,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import { createOrder } from "../../../config/orderService";
import cartService from "../../../config/cartService";

const AddToCart = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.user?.token);

  const [shipping, setShipping] = useState("flat");
  const [shippingAddress, setShippingAddress] = useState({
    street: "", city: "", state: "", postalCode: "",
  });
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [subtotal, setSubTotal] = useState(0)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const response = await cartService.getCart(token);
        console.log("Fetched Cart Response 👉", response);
        setCartItems(response || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setCartItems([]);
        setIsLoading(false);
      }
    };

    if (token) fetchCart();

    setShippingCost(shipping === "flat" ? 30 : 0)
  }, [token]);

  console.log(cartItems, ":cartItems")

  useEffect(() => {
   const subTotalDetails = cartItems.reduce((sum, item) => {
      const price = item?.product?.price || 0;
      const quantity = item?.quantity || 1;
      return sum + price * quantity;
    }, 0);

    setSubTotal(subTotalDetails);
  }, [cartItems])



  const total = subtotal + shippingCost;

  const handleQuantityChange = async (itemId, currentQuantity, type) => {
    try {
      const newQuantity = type === "increase" ? currentQuantity + 1 : currentQuantity - 1;
      const availableQuantity = cartItems.find(item => item.ItemId === itemId)?.availableQuantity || 0;

      console.log(newQuantity , ":newQuantity")

      console.log(availableQuantity, ":availableQuantity")
      if (newQuantity < 1 || newQuantity > availableQuantity) return;

      await cartService.updateQuantity(itemId, newQuantity, token);
      const response = await cartService.getCart(token);
      setCartItems(response?.items || []);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Could not update item quantity. Please try again.");
    }
  };

  const handleCheckout = async () => {
    const { street, city, state, postalCode } = shippingAddress;
    if (!street || !city || !state || !postalCode) {
      return alert("Please fill in your complete shipping address.");
    }

    const orderData = {
      items: cartItems.map(item => ({
        productId: item?.product?._id,
        quantity: item.quantity,
      })),
      shippingType: shipping,
      shippingAddress,
      total,
    };

    try {
      setIsLoading(true);
      const response = await createOrder(orderData, token);
      const orderId = response?.order?.OrderId;
      setIsLoading(false);
      if (orderId) navigate(`/ordersuccess/${orderId}`);
      else alert("Order creation failed.");
    } catch (error) {
      console.error("Order error:", error.response?.data || error.message);
      setIsLoading(false);
      alert("An error occurred during checkout.");
    }
  };

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="h6">Your Cart Is Currently Empty</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate("/#shop")}>
            Return to Shop
          </Button>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ px: { xs: 2, md: 6 }, py: 6, maxWidth: "1450px", mx: "auto" }}>
        <Typography variant="h4" fontWeight="bold" mb={4}>Shopping Cart</Typography>

        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={6}>
          {/* 🛒 CART LIST */}
          <Box flex={2}>
            <Box display="flex" fontWeight="bold" pb={1} borderBottom="2px solid #ccc" color="gray">
              <Box width="50%">Product</Box>
              <Box width="25%">Quantity</Box>
              <Box width="25%">Subtotal</Box>
            </Box>

            {cartItems.map((item) => {
              const product = item.product || {};
              const imageUrl = product.images?.[0]
                ? `${import.meta.env.VITE_BASE_URL}${product.images[0]}`
                : "/placeholder.svg";
              const name = product.name || "Unnamed Product";
              const quantity = item.requestedQuantity || 1;  // Using requestedQuantity
              const price = product.price || 0;
              const subtotalPerItem = price * quantity;

              return (
                <Box key={item.ItemId} display="flex" alignItems="center" py={3} borderBottom="1px solid #eee">
                  <Box width="50%" display="flex" alignItems="center">
                    <CardMedia
                      component="img"
                      image={imageUrl}
                      alt={name}
                      sx={{ width: 90, height: 110, objectFit: "cover", borderRadius: 2, mr: 2 }}
                    />
                    <Box>
                      <Typography fontWeight="bold">{name}</Typography>
                      <Typography variant="body2" color="text.secondary">PRADA</Typography> {/* Adjust as needed */}
                      <Typography variant="body2" mt={0.5}>
                        ₹{price.toFixed(2)} × {quantity}
                      </Typography>
                    </Box>
                  </Box>
                  <Box width="25%" display="flex" alignItems="center" gap={1.5}>
                    <IconButton onClick={() => handleQuantityChange(item.ItemId, quantity, "decrease")}>
                      <Remove />
                    </IconButton>
                    <Typography fontWeight="bold">{quantity}</Typography>
                    <IconButton onClick={() => handleQuantityChange(item.ItemId, quantity, "increase")}>
                      <Add />
                    </IconButton>
                  </Box>

                  <Box width="25%">
                    <Typography fontWeight="bold" color="primary">₹{subtotalPerItem.toFixed(2)}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* 📦 SUMMARY SECTION */}
          <Box
            flex={1}
            border="1px solid #ddd"
            borderRadius={3}
            p={3}
            boxShadow={2}
            sx={{
              position: { md: "sticky" }, top: 100, minWidth: "300px", backgroundColor: "#f9f9f9"
            }}
          >
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography fontWeight="bold" fontSize="16px">COUPON CODE</Typography>
              <Button size="small" variant="outlined">+</Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Subtotal</Typography>
              <Typography>₹{subtotal.toFixed(2)}</Typography>
            </Box>

            <Box mt={2}>
              <Typography fontWeight="bold" mb={1}>Shipping</Typography>
              <RadioGroup value={shipping} onChange={(e) => setShipping(e.target.value)}>
                <FormControlLabel value="flat" control={<Radio />} label="Flat rate: ₹30.00" />
                <FormControlLabel value="pickup" control={<Radio />} label="Local pickup" />
              </RadioGroup>
            </Box>

            <Divider sx={{ my: 2 }} />

            {["street", "city", "state", "postalCode"].map((field) => (
              <TextField
                key={field}
                fullWidth
                label={field[0].toUpperCase() + field.slice(1)}
                variant="outlined"
                value={shippingAddress[field]}
                onChange={(e) => setShippingAddress({ ...shippingAddress, [field]: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
            ))}

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" fontWeight="bold" mb={2}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">₹{total.toFixed(2)}</Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleCheckout}
              disabled={isLoading}
              sx={{
                backgroundColor: "#000", color: "#fff", py: 1.5,
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              {isLoading ? "Processing..." : "Checkout"}
            </Button>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default AddToCart;
