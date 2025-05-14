import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Selar_Navbar from '../dashboard/Selar_Navbar';
import Selar_Sidebar from '../dashboard/Selar_Sidebar';

const Order = () => {
  const token = useSelector((state) => state.seller.sellerInfo?.token);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setError("Unauthorized: Token missing. Please log in again.");
        setLoading(false);
        return;
      }
      console.log("Order Items Sample:", orders[0]?.items);


      try {
        const { data } = await axios.get(`${BASE_URL}/api/seller/allOrders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setOrders(data.orders || []);
        console.log("Fetched Orders:", data.orders);  // Logging fetched orders for better debugging
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId, itemId, newStatus) => {
    console.log("Updating status:", { orderId, itemId, newStatus });
    
    // Check if orderId and itemId are valid before making the request
    if (!orderId || !itemId) {
      console.error("Invalid orderId or itemId");
      alert("Invalid order or item ID");
      return;
    }

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/seller/orders/${orderId}/items/${itemId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Status updated successfully:", response.data);

      // Update state locally if needed
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? {
                ...order,
                items: order.items.map(item =>
                  item._id === itemId ? { ...item, status: newStatus } : item
                )
              }
            : order
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Try again.");
    }
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

        <div className="p-4 pt-24 pl-25">
          <h1 className="text-2xl font-bold mb-2">Seller Orders</h1>
          <p className="text-sm text-gray-600 mb-4">Total Orders: {orders.length}</p>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="overflow-x-auto ">
              <table className="min-w-[1000px] bg-white shadow-md rounded-xl overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr className="text-sm font-semibold text-left">
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Buyer</th>
                    <th className="px-6 py-3">Products</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id || order.orderId}>
  <td className="px-6 py-4 font-medium">{order._id || order.orderId}</td>
                      <td className="px-6 py-4">
                        {order.user ? (order.user.name || order.user.email || "N/A") : "N/A"}
                      </td>

                      <td className="px-6 py-4">
                        <ul className="list-disc list-inside space-y-1">
                          {order.items?.map((item) => (
                            <li key={item._id}>
                              {item.product?.title || "Product"} <span className="text-gray-500">(x{item.quantity})</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="space-y-2">
                          {order.items?.map((item) => (
                            <li key={item._id}>
                              <select
                                value={item.status}
                                onChange={(e) => handleStatusChange(order._id || order.orderId, item._id, e.target.value)}
                                className="text-sm bg-white border rounded px-2 py-1 shadow-sm"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Ready for Shipping">Ready for Shipping</option>
                                <option value="Ready for Delivery">Ready for Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-400 text-sm">Auto Save</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
