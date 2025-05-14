import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Selar_Sidebar from "../dashboard/Selar_Sidebar";
import Selar_Navbar from "../dashboard/Selar_Navbar";
import { FaPlus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

const UpdateProduct = () => {
  const { productId } = useParams();
  const token = useSelector((state) => state.seller.sellerInfo.token);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;


  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    subcategory: "",
    description: "",
    images: [],
  });
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ ...product });
  const [images, setImages] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      alert("Product not found");
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/seller/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProduct(response.data.products);
      setNewProduct(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setLoading(false);
      alert("Failed to load product data.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    setImages(e.target.files[0]);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("stock", newProduct.stock);
    formData.append("category", newProduct.category);
    formData.append("subcategory", newProduct.subcategory);
    formData.append("description", newProduct.description);

    if (images) {
      formData.append("images", images); // Use "images" or "image" based on your backend
    }

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/seller/products/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Product updated successfully!");
      navigate("/sellerproducts");
    } catch (error) {
      console.error("Error updating product:", error.response || error);
      alert("Failed to update product.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 fixed h-full bg-white shadow z-10">
        <Selar_Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="sticky top-0 z-10 bg-white shadow">
          <Selar_Navbar />
        </div>

        <div className="p-6 pt-24">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Update Product</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              <FaPlus /> {showForm ? "Close Form" : "Edit Product"}
            </button>
          </div>

          {loading ? (
            <p>Loading product data...</p>
          ) : showForm ? (
            <form
              onSubmit={handleProductSubmit}
              className="mb-8 bg-white p-6 rounded shadow space-y-4 border border-gray-200"
            >
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  name="price"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  name="stock"
                  placeholder="Stock"
                  value={newProduct.stock}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </div>

              <textarea
                name="description"
                placeholder="Description"
                value={newProduct.description}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />

              <select
                name="subcategory"
                value={newProduct.subcategory}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Subcategory</option>
                <option value="dress">Dress</option>
                <option value="jewelry">Jewelry</option>
                <option value="footwear">Footwear</option>
                <option value="shirt">Shirt</option>
                <option value="watch">Watch</option>
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block"
              />

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Update Product
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
