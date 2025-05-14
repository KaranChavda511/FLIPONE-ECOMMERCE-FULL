import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginAdmin } from "../../redux/adminSlice";

const Admin_Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state) => state.admin);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

 
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
      .max(30, 'Must be 30 characters or less')
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address")
      .required('Enter your Email'),
      password: Yup.string()
      .matches(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        "Password must contain at least one uppercase letter, one number, and one special character") 
        .required("Password is required"),
    }),
    onSubmit: (values) => {
      dispatch(loginAdmin(values));
    },
  });

  return (
    <div className="flex min-h-screen bg-green-400 items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-3xl bg-white rounded-lg overflow-hidden shadow-lg">
        <div className="w-full md:w-1/2 p-6">
          <h1 className="text-2xl font-bold text-green-700">Welcome</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Please login to your account by filling in this form:
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <form className="mt-4" onSubmit={formik.handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-gray-700 text-sm">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="coolname@name.com"
                className={`w-full mt-1 p-2 border rounded-md text-sm ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:border-green-500`}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="mt-3">
              <label className="block text-gray-700 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="********"
                  className={`w-full mt-1 p-2 pr-10 border rounded-md text-sm ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:border-green-500`}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <span
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </span>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm">{formik.errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                className="w-full bg-green-700 text-white p-2 rounded-md shadow-md hover:bg-green-800 text-sm"
              >
                {loading ? "Logging in..." : "LOGIN"}
              </button>
            </div>
          </form>
        </div>

        {/* Side Image */}
        <div className="w-full md:w-1/2 h-56 md:h-auto bg-cover bg-center">
          <img
            src="/login_side.jpg"
            className="w-full h-full object-cover"
            alt="Login Side"
          />
        </div>
      </div>
    </div>
  );
};

export default Admin_Login;
