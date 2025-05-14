import React, { useEffect, useState } from "react";
import { getOrderHistory } from "../../../config/orderService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

const OrderHistoryPage = () => {
  const token = useSelector((state) => state.auth?.user?.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    getOrderHistory(token)
      .then((data) => {
        setOrders(data.orders);
      })
      .catch((err) => {
        setError("Error fetching orders");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-center mt-6 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  return (
    <>
    <Navbar/>
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table className="min-w-full bg-white text-sm text-gray-700 border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Total</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.orderId}
                  className="hover:bg-gray-50 transition duration-150 border-b"
                >
                  <td className="py-3 px-4 font-medium">{order.orderId}</td>
                  <td className="py-3 px-4 capitalize">{order.status}</td>
                  <td className="py-3 px-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    ₹{order.totalAmount?.toFixed(2) || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => navigate(`/ordersuccess/${order.orderId}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default OrderHistoryPage;
