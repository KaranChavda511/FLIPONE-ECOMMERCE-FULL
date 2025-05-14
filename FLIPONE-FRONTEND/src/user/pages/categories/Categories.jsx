import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

// Define the base URL for API calls
const BASE_URL = ""; // Replace with your actual backend URL

const ProductSection = ({ title, products, loading }) => {
  // Log the products to check their structure
  console.log('Products in ProductSection:', products);

  return (
    <Box
      sx={{
        py: { xs: 6, sm: 8 },
        px: { xs: 2, sm: 4 },
        textAlign: "center",
        background: "linear-gradient(to right, #fff5f7, #f0f4ff)",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="medium"
        color="text.secondary"
        mb={4}
        sx={{ fontStyle: "italic" }}
      >
        {title}
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {Array.isArray(products) && products.length > 0 ? (
            products.map((item, index) => (
              <Grid item key={item._id || index} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    backgroundColor: "#fff",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={
                      item?.images?.length
                        ? `${BASE_URL}/${item.images[0]}`
                        : "./18505047_SL-070720-32260-21.svg"
                    }
                    alt={`Product ${index + 1}`}
                    sx={{
                      height: 400,
                      width: "100%",
                      objectFit: "cover",
                      borderRadius: "12px 12px 0 0",
                    }}
                  />
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight="bold" mb={1}>
                      Price: ₹{item.price}
                    </Typography>
                    <IconButton color="primary">
                      <LocalMallIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary">
              No products available for this category.
            </Typography>
          )}
        </Grid>
      )}
    </Box>
  );
};

const Categories = () => {
  const [categories] = useState([
    "dresses",
    "shirts",
    "accessories",
    "watches",
    "glasses",
    "footwear",
    "shoes",
  ]);

  const [productsByCategory, setProductsByCategory] = useState({});
  const [loadingCategory, setLoadingCategory] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products and category-specific products
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all products
        const res = await axios.get(`${BASE_URL}/api/product`);
        setAllProducts(res.data.products || []);

        // Log the fetched allProducts data
        // console.log('All Products:', res.data.products);

        // Fetch products for each category
        categories.forEach((category) => {
          fetchProducts(category);
        });
      } catch (error) {
        // console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async (category) => {
      try {
        setLoadingCategory((prev) => ({ ...prev, [category]: true }));
        const res = await axios.get(
          `${BASE_URL}/api/product/categories?category=${category}`
        );
        
        // Log category-specific products
        console.log(`Products for ${category}:`, res.data);

        // Ensure that we're storing an array in productsByCategory
        setProductsByCategory((prev) => ({
          ...prev,
          [category]: Array.isArray(res.data) ? res.data : [],
        }));
      } catch (error) {
        console.error(`Error fetching ${category}:`, error);
        setProductsByCategory((prev) => ({ ...prev, [category]: [] }));
      } finally {
        setLoadingCategory((prev) => ({ ...prev, [category]: false }));
      }
    };

    fetchData();
  }, [categories]);

  return (
    <>
      <Navbar />
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h4" fontWeight="bold" mb={2} color="primary">
          Let's Shop Now...
        </Typography>
        <Typography
          variant="h6"
          fontWeight="medium"
          color="text.secondary"
          mb={4}
          sx={{ fontStyle: "italic" }}
        >
          Trendy & Elegant Products Await!
        </Typography>
      </Box>

      {categories.map((cat) => (
        <ProductSection
          key={cat}
          title={cat.charAt(0).toUpperCase() + cat.slice(1)}
          products={productsByCategory[cat] || []}
          loading={loadingCategory[cat]}
        />
      ))}

      <Footer />
    </>
  );
};

export default Categories;
