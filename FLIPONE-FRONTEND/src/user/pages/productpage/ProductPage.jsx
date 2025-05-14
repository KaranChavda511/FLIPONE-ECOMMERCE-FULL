import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  CardMedia,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { addToCartAsync } from "../../../redux/createSlice";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import axios from "axios";

const ProductPage = () => {
  const { id } = useParams();
  console.log("Product ID from URL:", id);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await axios.get(`${BASE_URL}/api//product/product/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProduct(res.data.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, BASE_URL]);

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    dispatch(addToCartAsync(product));
  };

  if (loading) return <CircularProgress />;
  if (!product) return <Typography>Product not found</Typography>;
 
  return (
    <>
      <Navbar />
      <Box sx={{ p: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        <CardMedia
          component="img"
          image={
            product?.images?.length
              ? `${BASE_URL}${product.images[0]}`
              : "./18505047_SL-070720-32260-21.svg"
          }
          alt={product.name}
          sx={{ width: "100%", maxWidth: 500, objectFit: "contain" }}
        />
        <Box>
          <Typography variant="h4" fontWeight="bold">{product.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{product.brand}</Typography>
          <Typography sx={{ my: 2 }}>{product.description}</Typography>
          <Typography variant="h6">₹{product.price}</Typography>
          {product.originalPrice && (
            <Typography
              variant="body2"
              sx={{ textDecoration: "line-through" }}
              color="text.secondary"
            >
              ₹{product.originalPrice}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
          </Typography>
          <Box mt={2}>
            <Button variant="contained" onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to Cart
            </Button>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default ProductPage;
