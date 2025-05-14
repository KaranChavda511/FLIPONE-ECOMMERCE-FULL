import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Admin_Sidebar from "../pages/Admin_Sidebar";
import Admin_Navbar from "../pages/Admin_Navbar";

const Product_Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Number of products per page
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const adminToken = JSON.parse(localStorage.getItem("adminAuth"))?.token;
        const res = await axios.get(`${BASE_URL}/api/admin/product-list`, {
          params: {
            page: currentPage,
            limit: itemsPerPage, 
          },
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
        
        
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages); 
      } catch (err) {
        console.error("Failed to fetch products:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, itemsPerPage]); 
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex">
      <div className="w-64 fixed h-full bg-white shadow z-10">
        <Admin_Sidebar />
      </div>

      <div className="flex-1 ml-64">
        <div className="sticky top-0 z-20 bg-white shadow">
          <Admin_Navbar />
        </div>

        <div className="p-6 pt-24">
          <h2 className="text-3xl font-bold">Product Catalog</h2>

          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Product</th>
                    <th className="px-6 py-3 font-semibold">Category</th>
                    <th className="px-6 py-3 font-semibold">Price</th>
                    <th className="px-6 py-3 font-semibold">Stock</th>
                    <th className="px-6 py-3 font-semibold">Seller</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          {product.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">{product.category?.name || 'N/A'}</td>
                      <td className="px-6 py-4">₹{product.price}</td>
                      <td className="px-6 py-4">{product.stock}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(`/seller/${product.seller?._id}`)
                          }
                          className="text-blue-600 hover:underline"
                        >
                          {product.seller?.name || 'N/A'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md mr-2"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md ml-2"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product_Catalog;
