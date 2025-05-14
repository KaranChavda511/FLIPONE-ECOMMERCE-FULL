import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import backgroundImage from "/main-first-section-bg.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addToCartAsync } from "../../../redux/createSlice";
 
const Mainpage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const productSectionRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };
 
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace("#", "");
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);
 
  const handleAddToCart = useCallback((product) => {
    dispatch(addToCartAsync(product));
  }, [dispatch]);
 
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/product`);
        setProducts(res.data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
 
    fetchProducts();
  }, [BASE_URL]);
 
  return (
    <>
      <Navbar />
 
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          color: "white",
          display: "flex",
          flexDirection: "column",
          pt: "64px",
        }}
      >
        <Box sx={{ textAlign: "center", mt: "auto", mb: 6 }}>
          <Typography variant="h3" fontWeight="bold">
            Your One-Stop Shop For Everything
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Connecting buyers and sellers on one powerful platform
          </Typography>
          <Button
            variant="contained"
            sx={{ borderRadius: 2, bgcolor: "white", color: "black" }}
            onClick={scrollToProducts}
          >
            Shop Now
          </Button>
        </Box>
      </Box>
 
      {/* Products Section */}
      <Box
        ref={productSectionRef}
        sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 }, textAlign: "center" }}
        id="shop"
      >
        <Typography variant="h4" fontWeight="bold" mb={2}>
          BEST OUTFIT FOR YOUR HAPPINESS
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          LOWER PRICES
        </Typography>
 
        {loading ? (
          <CircularProgress />
        ) : products.length === 0 ? (
          <Typography color="error">No products found.</Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {products.map((item) => (
              <Grid item key={item._id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  onClick={() => navigate(`/product/${item._id}`)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: 3,
                    position: "relative",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "scale(1.02)" },
                    cursor: "pointer",
                  }}
                >
                  {/* Tags */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      zIndex: 2,
                    }}
                  >
                    {item.isBestSeller && (
                      <TagBox text="BEST SELLER" bgColor="black" />
                    )}
                    {item.isFeatured && (
                      <TagBox text="FEATURED" bgColor="#616161" />
                    )}
                    {item.discount && (
                      <TagBox text={`-${item.discount}%`} bgColor="#f44336" />
                    )}
                  </Box>
 
                  <CardMedia
                    component="img"
                    image={
                      item?.images?.[0]
                        ? `${BASE_URL}${item.images[0]}`
                        : "/placeholder.svg"
                    }
                    alt={item.name}
                    sx={{
                      width: "100%",
                      height: 250,
                      objectFit: "cover",
                      borderRadius: "12px 12px 0 0",
                    }}
                  />
 
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography fontSize={14} color="text.secondary">
                      {item.brand || "BRAND NAME"}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mb={1}
                      sx={{
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.description || "Product description..."}
                    </Typography>
 
                    <Typography variant="body1" fontWeight="bold">
                      ₹{item.price}
                      {item.originalPrice && (
                        <Typography
                          component="span"
                          sx={{
                            textDecoration: "line-through",
                            ml: 1,
                            fontSize: 14,
                          }}
                          color="text.secondary"
                        >
                          ₹{item.originalPrice}
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.stock > 0
                        ? `Available: ${item.stock}`
                        : "Out of Stock"}
                    </Typography>
                  </CardContent>
 
                  <Box mt="auto" textAlign="center" pb={2}>
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                      sx={{ border: "1px solid", borderRadius: 2 }}
                    >
                      <LocalMallIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
 
      {/* Footer */}
      <Box sx={{ maxWidth: "100%", mx: "auto" }}>
        <Footer />
      </Box>
    </>
  );
};
 
// Reusable Tag Box
const TagBox = ({ text, bgColor }) => (
  <Box
    sx={{
      bgcolor: bgColor,
      color: "white",
      fontSize: "12px",
      px: 1,
      py: 0.5,
      borderRadius: 1,
    }}
  >
    {text}
  </Box>
);
 
export default Mainpage;