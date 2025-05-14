import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Container,
  Badge,
  Button,
  Menu,
  MenuItem,
  Avatar,
  InputBase,
  ClickAwayListener,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
  // import { getOrderHistory } from "../../../config/orderService";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../redux/authSlice";
  // import { useParams } from "react-router-dom";

import axios from "axios";

// Pages in the navbar
const pages = [
  { name: "HOME", path: "/" },
  { name: "SHOP", path: "/#shop" },
  { name: "BLOG", path: "/blog" },
  { name: "CONTACT", path: "/contact" },
];

// Category Menu Component
const CategoryMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedCategory("");
  };

  const handleNavigate = (path) => {
    handleClose();
    navigate(path);  // Navigate to the subcategory path
  };

  const subcategories = {
    Women: [
      { name: "Dress", path: "/women/dress" },
      { name: "Jewelry", path: "/women/jewelry" },
      { name: "Footwear", path: "/women/footwear" },
    ],
    Men: [
      { name: "Shirt", path: "/men/shirt" },
      { name: "Watch", path: "/men/watch" },
      { name: "Shoes", path: "/men/shoes" },
    ],
  };

  return (
    <Box sx={{ backgroundColor: "#fff", py: 1 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
          <Button
            sx={{ color: "#000", fontWeight: "bold" }}
            onClick={(e) => handleOpen(e, "Women")}
          >
            Women
          </Button>
          <Button
            sx={{ color: "#000", fontWeight: "bold" }}
            onClick={(e) => handleOpen(e, "Men")}
          >
            Men
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {subcategories[selectedCategory]?.map((sub) => (
              <MenuItem key={sub.name} onClick={() => handleNavigate(sub.path)}>
                {sub.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Container>
    </Box>
  );
};

// Main Navbar Component
const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  const totalQuantity = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item?.quantity || 0), 0)
    : 0;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  // const { orderId } = useParams();
  // const [orderDetails, setOrderDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  // const token = useSelector((state) => state.auth?.user?.token);


  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("userAuth");
    handleClose();
    navigate("/login");
  };

  const handleProfile = () => {
    if (user) {
      handleClose();
      navigate("/updateprofile");
    } else {
      navigate("/login");
    }
  };
  const handleOrders = () => {
    handleClose();
    navigate("/order-history");
  };
  
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/api/product/search?q=${searchQuery}`
      );
      setSearchResults(response.data.products);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      alert("Something went wrong during the search.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#fff", color: "#000" }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", py: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              MODERNO
            </Typography>

            {/* Navigation Links */}
            <Box sx={{ backgroundColor: "#fff", py: 1 }}>
              <Container maxWidth="xl">
                <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
                  {pages.map((page) => (
                    <Button
                      key={page.name}
                      onClick={() => navigate(page.path)}
                      sx={{ color: "#000", fontWeight: "bold" }}
                    >
                      {page.name}
                    </Button>
                  ))}
                </Box>
              </Container>
            </Box>

            {/* Search */}
            <ClickAwayListener onClickAway={() => setShowSearchResults(false)}>
              <Box sx={{ position: "relative", width: 300 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: "#f1f1f1",
                    px: 1,
                    borderRadius: 1,
                  }}
                >
                  <InputBase
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ ml: 1, flex: 1 }}
                  />
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                </Box>

                {showSearchResults && searchResults.length > 0 && (
                  <ClickAwayListener
                    onClickAway={() => setShowSearchResults(false)}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        maxHeight: 300,
                        overflowY: "auto",
                        backgroundColor: "#fff",
                        boxShadow: 2,
                        zIndex: 99,
                        borderRadius: 1,
                        mt: 1,
                      }}
                    >
                      {searchResults.map((product) => (
                        <Box
                          key={product._id}
                          onClick={() => {
                            navigate(`/product/${product._id}`);
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 1,
                            borderBottom: "1px solid #eee",
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#f5f5f5" },
                          }}
                        >
                          <img
                            src={`${BASE_URL}${product.images[0]}`}
                            alt={product.name}
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle2">
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ₹{product.price}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </ClickAwayListener>
                )}
              </Box>
            </ClickAwayListener>

            {/* Icons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              {user ? (
                <>
                  <IconButton onClick={() => navigate("/addtocart")}>
                    <Badge badgeContent={totalQuantity} color="primary">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>

                  <IconButton onClick={handleMenuClick}>
                    <Avatar>{user.name?.charAt(0).toUpperCase() || "U"}</Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <MenuItem onClick={handleProfile}>Profile</MenuItem>
                    <MenuItem onClick={handleOrders}>My Orders</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <IconButton onClick={() => navigate("/login")}>
                  <AccountCircleIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Category Menu */}
      <CategoryMenu />
    </>
  );
};

export default Navbar;
