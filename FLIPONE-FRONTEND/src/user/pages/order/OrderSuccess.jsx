  import React, { useEffect, useState } from "react";
  import { Box, Typography, Divider, CircularProgress, Card, CardContent, CardMedia, Grid } from "@mui/material";
  import { useParams } from "react-router-dom";
  import { useSelector } from "react-redux";
  import { getOrderHistory } from "../../../config/orderService";
  import Navbar from "../navbar/Navbar";
  import Footer from "../footer/Footer";
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const OrderSuccess = () => {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = useSelector((state) => state.auth?.user?.token);

    useEffect(() => {
      if (!token) {
        setError("User is not authenticated.");
        setLoading(false);
        return;
      }

      getOrderHistory(token)
        .then((response) => {
          const ordersArray = response.orders;
          // const order = ordersArray.find((o) => String(o.OrderId) === String(orderId));
          const order = ordersArray.find((o) => String(o.orderId) === String(orderId));


          if (order) {
            setOrderDetails(order);
          } else {
            setError("Order not found.");
          }
        })
        .catch((err) => {
          console.error("Error loading order:", err);
          setError("An error occurred while fetching your order.");
        })
        .finally(() => setLoading(false));
    }, [orderId, token]);

    if (loading) return <Box p={5}><CircularProgress /></Box>;
    if (error) return <Box p={5}><Typography color="error">{error}</Typography></Box>;

    return (
      <>
      <Navbar/>
      <Box p={{ xs: 3, md: 5 }} maxWidth="900px" mx="auto">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Order Confirmed!
        </Typography>
        <Typography variant="subtitle1" mb={2}>
          Thank you for your purchase.
        </Typography>

        <Box mb={2}>
        {/* <Typography variant="body1"><strong>Order ID:</strong> {orderDetails.OrderId}</Typography>
         */}
         <Typography variant="body1"><strong>Order ID:</strong> {orderDetails.orderId}</Typography>
        <Typography variant="body1"><strong>Status:</strong> {orderDetails.status}</Typography>
          <Typography variant="body1"><strong>Date:</strong> {formatDate(orderDetails.date)}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" mb={2}>Ordered Items</Typography>
        <Grid container spacing={2}>
          {(orderDetails.items || []).map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                {item.image && (
                  <CardMedia
                    component="img"
                    height="160"
                    image={item.image}
                    alt={item.name}
                  />
                )}
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                  <Typography variant="body2">Quantity: {item.quantity}</Typography>
                  <Typography variant="body2">Price: ₹{item.price}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box mt={2}>
          <Typography variant="h6"><strong>Total Amount:</strong> ₹{orderDetails.totalAmount?.toFixed(2)}</Typography>
        </Box>
      </Box>
      <Footer/>
      </>
    );
  };

  export default OrderSuccess;
