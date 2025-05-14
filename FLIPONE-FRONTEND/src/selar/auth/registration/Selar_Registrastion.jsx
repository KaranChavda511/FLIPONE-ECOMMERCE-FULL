import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  Grid,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../../../../public/background-image-reg-loin.jpg';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import Navbar from "../../../user/pages/navbar/Navbar";

const validationSchema = Yup.object({
  name: Yup.string()
    .max(35, 'Must be 35 characters or less')
    .required('Enter your name'),
  email: Yup.string()
    .max(30, 'Must be 30 characters or less')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address")
    .required('Enter your Email'),
  password: Yup.string()
    .length(8, 'Must be exactly 8 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "Password must contain at least one uppercase letter, one number, and one special character"
    )
    .required('Enter your Password'),
});

const Selar_Registrastion = () => {
  const [showPassword, setShowPassword] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/seller/signup`, values);
      toast.success("Registration successful!");
      console.log("Registration Response:", response.data);

      // Optionally save the token or user data if needed
      // localStorage.setItem("sellerAuth", JSON.stringify(response.data));

      setTimeout(() => {
        navigate("/selar_login");
      }, 2000);
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />

      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          minHeight: '100vh',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              p: 4,
              boxShadow: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
              Seller Registration
            </Typography>
            <Formik
              initialValues={{
                name: '',
                email: '',
                password: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              validateOnBlur={false}
              validateOnChange={false}
            >
              {({ touched, errors, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      variant="outlined"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />

                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      variant="outlined"
                      type="email"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      variant="outlined"
                      type={showPassword ? 'text' : 'password'}
                      inputProps={{ maxLength: 8 }}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleTogglePassword} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      type="submit"
                      disabled={isSubmitting}
                      sx={{ mt: 2 }}
                    >
                      {isSubmitting ? "Registering..." : "Register"}
                    </Button>
                  </Grid>

                  <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Already have an account?{' '}
                    <Link to="/Selar_Login" style={{ textDecoration: 'none', color: '#1976D2', fontWeight: 'bold' }}>
                      Login Now
                    </Link>
                  </Typography>
                </form>
              )}
            </Formik>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default Selar_Registrastion;
