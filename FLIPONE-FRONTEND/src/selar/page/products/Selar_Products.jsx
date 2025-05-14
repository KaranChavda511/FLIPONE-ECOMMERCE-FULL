import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Selar_Sidebar from "../dashboard/Selar_Sidebar";
import Selar_Navbar from "../dashboard/Selar_Navbar";
import { FaEdit, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Selar_Products = () => {
  const sellerInfo = useSelector((state) => state.seller?.sellerInfo);
  const token = sellerInfo?.token;

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const ImageBaseURL = import.meta.env.VITE_BASE_URL;

  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/seller/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    try {
      await axios.post(`${BASE_URL}/api/seller/upload-product-images`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Image uploaded successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    }
  };

  const getSubcategories = (category) => {
    if (category === "women") return ["dress", "jwellery", "footwear"];
    if (category === "men") return ["shirt", "watch", "shoes"];
    return [];
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 fixed h-full bg-white shadow z-10">
        <Selar_Sidebar />
      </div>

      <div className="flex-1 ml-64">
        <div className="sticky top-0 z-10 bg-white shadow">
          <Selar_Navbar />
        </div>

        <div className="p-6 pt-24">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Seller Products</h1>
            <div className="flex flex-wrap gap-4">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                <FaPlus /> {showForm ? "Close Form" : "Add New Product"}
              </button>
            </div>
          </div>

          {showForm && (
            <Formik
              enableReinitialize
              initialValues={{
                name: "",
                description: "",
                price: "",
                stock: "",
                category: "",
                subcategories: "",
              }}
              validationSchema={Yup.object({
                name: Yup.string().required("Name is required"),
                description: Yup.string().required("Description is required"),
                price: Yup.number().required("Price is required").positive(),
                stock: Yup.number().required("Stock is required").integer().min(0),
                category: Yup.string().required("Category is required"),
                subcategories: Yup.string().required("Subcategories are required"),
              })}
              onSubmit={async (values, { resetForm }) => {
                const subcategoryArray = values.subcategories
                  .split(",")
                  .map((item) => item.trim());

                if (!images) return alert("Please select an image");

                const formData = new FormData();
                formData.append("name", values.name);
                formData.append("description", values.description);
                formData.append("price", values.price);
                formData.append("stock", values.stock);
                formData.append("category", values.category);
                formData.append("subcategories", JSON.stringify(subcategoryArray));
                formData.append("images", images);

                try {
                  await axios.post(`${BASE_URL}/api/seller/add-product`, formData, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "multipart/form-data",
                    },
                  });
                  alert("Product added successfully!");
                  setShowForm(false);
                  resetForm();
                  setImages(null);
                  setImagePreview(null);
                  setSelectedCategory("");
                  fetchProducts();
                } catch (err) {
                  console.error("Error adding product:", err);
                  alert("Failed to add product.");
                }
              }}
            >
              {({ values, setFieldValue }) => (
                <Form className="mb-8 bg-white p-6 rounded shadow space-y-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Field name="name" type="text" placeholder="Name" className="border p-2 rounded w-full" />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div>
                      <Field
                        name="category"
                        as="select"
                        className="border p-2 rounded w-full"
                        onChange={(e) => {
                          const selected = e.target.value;
                          setSelectedCategory(selected);
                          setFieldValue("category", selected);
                          setFieldValue("subcategories", "");
                        }}
                      >
                        <option value="">Select Category</option>
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                      </Field>
                      <ErrorMessage name="category" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div>
                      <Field name="price" type="number" placeholder="Price" className="border p-2 rounded w-full" />
                      <ErrorMessage name="price" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div>
                      <Field name="stock" type="number" placeholder="Stock" className="border p-2 rounded w-full" />
                      <ErrorMessage name="stock" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  <div>
                    <Field name="description" as="textarea" placeholder="Description" className="border p-2 rounded w-full" />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-sm" />
                  </div>

                  <div>
                    <Field name="subcategories" as="select" className="border p-2 rounded w-full">
                      <option value="">Select Subcategory</option>
                      {getSubcategories(selectedCategory).map((sub) => (
                        <option key={sub} value={sub}>
                          {sub.charAt(0).toUpperCase() + sub.slice(1)}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="subcategories" component="div" className="text-red-500 text-sm" />
                  </div>

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.currentTarget.files[0];
                        setImages(file);
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="block"
                      required
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Image Preview:</p>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mt-1 w-24 h-24 object-cover border rounded"
                        />
                      </div>
                    )}
                  </div>

                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                    Add Product
                  </button>
                </Form>
              )}
            </Formik>
          )}

          <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
            {loading ? (
              <p className="p-4">Loading products...</p>
            ) : !Array.isArray(products) || products.length === 0 ? (
              <p className="p-4">No products found.</p>
            ) : (
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Image</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Subcategories</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Stock</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id || product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {product.images?.length > 0 ? (
                          <img
                            src={`${ImageBaseURL}${product.images[0]}`}
                            alt="Product"
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name || "N/A"}</td>
                      <td className="px-6 py-4">{product.category?.name || product.category || "N/A"}</td>
                      <td className="px-6 py-4">
                        {Array.isArray(product.subcategories) ? product.subcategories.join(", ") : "N/A"}
                      </td>
                      <td className="px-6 py-4">{product.price || "N/A"}</td>
                      <td className="px-6 py-4">{product.stock || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600">{product.description || "N/A"}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          className="text-yellow-600 hover:underline cursor-pointer"
                          onClick={() => navigate(`/UpdateProduct/${product._id}`)}
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Selar_Products;
