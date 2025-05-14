// pages/Order_Manage.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Admin_Sidebar from "../pages/Admin_Sidebar";
import Admin_Navbar from "../pages/Admin_Navbar";
// ...imports remain the same
import { MdOutlineDeleteForever } from "react-icons/md";
import Switcher2 from "../managements/Switcher";

const Order_Manage = () => {
  const { adminInfo } = useSelector((state) => state.admin);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/admin/orders`, {
          headers: {
            Authorization: `Bearer ${adminInfo?.token}`,
          },
        });
        setOrders(response?.data?.orders ?? []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (adminInfo?.token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [adminInfo]);

  const toggleOrderStatus = async (id, isShipped) => {
    const confirmToggle = window.confirm(
      `Are you sure you want to mark this order as ${isShipped ? "unshipped" : "shipped"}?`
    );
    if (!confirmToggle) return;

    try {
      const endpoint = `${BASE_URL}/api/admin/orders/${id}/toggle-status`;
      await axios.patch(endpoint, {}, {
        headers: { Authorization: `Bearer ${adminInfo?.token}` },
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, isShipped: !isShipped } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status.");
    }
  };

  const deleteOrder = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;

    try {
      const endpoint = `${BASE_URL}/api/admin/orders/${id}/delete`;
      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${adminInfo?.token}` },
      });

      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 fixed h-full bg-white shadow z-10">
        <Admin_Sidebar />
      </div>

      <div className="flex-1 ml-64">
        <div className="sticky top-0 z-10 bg-white shadow">
          <Admin_Navbar />
        </div>

        <div className="p-6 pt-24">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Order Management</h1>

          <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
            {loading ? (
              <p className="p-4">Loading orders...</p>
            ) : !Array.isArray(orders) || orders.length === 0 ? (
              <p className="p-4">No orders found.</p>
            ) : (
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Customer Name</th>
                    <th className="px-6 py-3">Total Price</th>
                    <th className="px-6 py-3">Order Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const firstItem = order.items?.[0];
                    const imageUrl = firstItem?.product?.image || firstItem?.image || null;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {order._id || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {imageUrl ? (
                            <img src={imageUrl} alt="product" className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <span className="text-gray-400 italic">No image</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{order.customer?.name || "N/A"}</td>
                        <td className="px-6 py-4">₹{order.totalPrice?.toFixed(2) || "0.00"}</td>
                        <td className="px-6 py-4">
                          {order.orderDate ? new Date(order.orderDate).toLocaleString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <Switcher2
                            isChecked={order.isShipped}
                            onToggle={() => toggleOrderStatus(order._id, order.isShipped)}
                          />
                          <span className={`text-sm ${order.isShipped ? "text-green-600" : "text-yellow-600"}`}>
                            {order.isShipped ? "Shipped" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-red-600 hover:underline cursor-pointer"
                            onClick={() => deleteOrder(order._id)}
                            title="Delete Order"
                          >
                            <MdOutlineDeleteForever className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order_Manage;  