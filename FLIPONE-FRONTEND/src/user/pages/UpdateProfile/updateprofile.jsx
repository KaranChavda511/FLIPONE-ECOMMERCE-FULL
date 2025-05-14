import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar/navbar";
import backgroundImage from "/background-image-reg-loin.jpg";
import { useSelector } from "react-redux";

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string().max(35, "Must be 35 characters or less").required("Enter your name"),
  email: Yup.string()
      .max(30)
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter valid email")
      .required("Enter your Email"),
  mobile: Yup.string().matches(/^[0-9]{10}$/, "Enter a valid 10-digit number").required("Enter your Mobile Number"),
  address: Yup.string().required("Enter your address"),
});

const UpdateProfile = () => {
  const navigate = useNavigate();

  // Fetch token from localStorage if not in Redux
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        toast.error("No token found, please log in again.");
        navigate("/login");
        return;
      }

      try {
        // Log the token to ensure it's valid
        console.log("Token:", token);

        const response = await axios.get(`${BASE_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserDetails(response.data.user);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error.response?.data || error.message);
        toast.error("Failed to fetch user data. Please login again.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, BASE_URL, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { name, mobile, address } = values;

      await axios.patch(
        `${BASE_URL}/api/user/profile`,
        { name,   mobile, address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Profile updated successfully!");
      setTimeout(() => {
        navigate("/mainpage");
      }, 2000);
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Typography align="center">Loading profile...</Typography>;
  }

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="sm">
          {/* <Card
            sx={{
              p: 4,
              boxShadow: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(10px)",
            }}
          > */}
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
              Update Profile
            </Typography>

            <Formik
              initialValues={{
                name: userDetails?.name ?? "",
                email: userDetails ?. email ?? "" ,
                mobile: userDetails?.mobile ?? "",
                address: userDetails?.address ?? "",
              }}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              validateOnBlur={false}
              validateOnChange={false}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        variant="outlined"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.name && touched.name)}
                        helperText={errors.name && touched.name && errors.name}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        disabled
                        variant="outlined"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.email && touched.email)}
                        helperText={errors.email && touched.email && errors.email}
                      />
                    </Grid>



                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mobile"
                        name="mobile"
                        variant="outlined"
                        value={values.mobile}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.mobile && touched.mobile)}
                        helperText={errors.mobile && touched.mobile && errors.mobile}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        variant="outlined"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.address && touched.address)}
                        helperText={errors.address && touched.address && errors.address}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Updating..." : "Update"}
                      </Button>
                    </Grid>


                  </Grid>
                </form>
              )}
            </Formik>
          
        </Container>
      </div>
    </>
  );
};

export default UpdateProfile;
