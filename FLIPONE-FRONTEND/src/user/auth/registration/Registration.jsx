import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  Grid,
  IconButton,
  InputAdornment,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LockIcon from "@mui/icons-material/Lock";
import HomeIcon from "@mui/icons-material/Home";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "/background-image-reg-loin.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userSignup } from "../../../config/Dataservice";

const validationSchema = Yup.object({
  name: Yup.string().max(35).required("Enter your name"),
  email: Yup.string()
    .max(30)
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter valid email")
    .required("Enter your Email"),
  mobile: Yup.string()
    // .min(10, "Must be exactly 8 characters")
    .matches(/^[0-9]{10}$/, "Enter valid 10-digit number")
    .required("Enter your Mobile Number"),
  password: Yup.string()
    .min(8, "Must be exactly 8 characters")
    .matches(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "Password must contain at least one uppercase letter, one number, and one special character"
    )
    .required("Enter your Password"),
  address: Yup.string().required("Enter your address"),
});

const Registration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleFormSubmit = async (values) => {
    try {
      const response = await userSignup(values);

      if (response.status === 201) {
        toast.success(response.data.message || "Registered successfully");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 4, boxShadow: 6, borderRadius: 3, backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
            Register Now
          </Typography>

          <Formik
            initialValues={{ name: "", email: "", mobile: "", password: "", address: "" }}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({ errors, handleChange, handleSubmit, handleBlur }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  {[ 
                    { name: "name", label: "Name", icon: <PersonIcon />, type: "text" },
                    { name: "email", label: "Email", icon: <EmailIcon />, type: "email" },
                    { name: "mobile", 
                      label: "Mobile",
                     icon: <PhoneAndroidIcon />,
                      type: "tel"  , 
                      inputProps: {
                      maxLength: 10,
                    },},
                    {
                      name: "password",
                      label: "Password",
                      icon: <LockIcon />,
                      type: showPassword ? "text" : "password",
                      endIcon: (
                        <IconButton onClick={handleTogglePassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                      inputProps: {
                        maxLength: 8,
                      },
                    },
                    { name: "address", label: "Address", icon: <HomeIcon />, type: "text" },
                  ].map((field, idx) => (
                    <Grid item xs={12} key={idx}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors[field.name])}
                        helperText={errors[field.name]}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">{field.icon}</InputAdornment>
                          ),
                          endAdornment: field.endIcon ? (
                            <InputAdornment position="end">{field.endIcon}</InputAdornment>
                          ) : null,
                          inputProps: field.inputProps,
                        }}
                      />
                    </Grid>
                  ))}

                  <Grid item xs={12}>
                    <Button type="submit" fullWidth variant="contained" size="large">
                      Register
                    </Button>
                  </Grid>
                </Grid>

                <Typography align="center" sx={{ mt: 3 }}>
                  Already have an account?{" "}
                  <Link to="/login" style={{ color: "#1976D2", fontWeight: "bold" }}>
                    Login Now
                  </Link>
                </Typography>
              </form>
            )}
          </Formik>
        </Card>
        <ToastContainer position="top-center" />
      </Container>
    </div>
  );
};

export default Registration;
