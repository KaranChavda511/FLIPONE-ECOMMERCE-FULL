import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Container,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import backgroundImage from '/Contact-pade-image.jpg';
import Navbar from "../../../user/pages/navbar/Navbar";
import Footer from '../footer/Footer';


const Contact = () => {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number')
      .required('Mobile number is required'),
    message: Yup.string().required('Message is required'),
  });

  const handleSubmit = (values, { resetForm }) => {
    console.log(values);
    alert('Form submitted successfully!');
    resetForm();
  };

  return (
    <>
          <Navbar/>
      
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          width: '100%',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 2,
        }}
      >
        <Typography variant="h3" fontWeight="bold" mb={2}>
          What Our Customers Say
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Hear from shoppers and sellers who have experienced our platform.
        </Typography>
        <Button
          variant="contained"
          sx={{
            borderRadius: 3,
            bgcolor: 'white',
            color: 'black',
            '&:hover': { bgcolor: '#e0e0e0' },
          }}
          onClick={scrollToForm}
        >
          Contact Us
        </Button>
      </Box>

      {/* Contact Form Section */}
      <Box
        ref={formRef}
        sx={{
          py: 8,
          backgroundColor: '#f5f5f5',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={4}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              backgroundColor: 'white',
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              mb={4}
              color="primary"
            >
              Get in Touch
            </Typography>

            <Formik
              initialValues={{
                name: '',
                email: '',
                mobile: '',
                message: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                touched,
                errors,
                handleChange,
                handleBlur,
                handleSubmit,
              }) => (
                <form onSubmit={handleSubmit} noValidate>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Mobile No"
                        name="mobile"
                        type="tel"
                        value={values.mobile}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.mobile && Boolean(errors.mobile)}
                        helperText={touched.mobile && errors.mobile}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Message"
                        name="message"
                        multiline
                        minRows={4}
                        value={values.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.message && Boolean(errors.message)}
                        helperText={touched.message && errors.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        type="submit"
                        sx={{
                          bgcolor: '#1976d2',
                          color: 'white',
                          borderRadius: 3,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.2,
                          '&:hover': {
                            bgcolor: '#115293',
                          },
                          
                        }}
                        onClick={() => navigate("/")}
                      >
                        Submit
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </Paper>
        </Container>
      </Box>
      <Footer/>
    </>
  );
};

export default Contact;
