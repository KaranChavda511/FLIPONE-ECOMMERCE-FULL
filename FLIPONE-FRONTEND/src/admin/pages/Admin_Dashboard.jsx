import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Admin_Sidebar from "./Admin_Sidebar";
import Admin_Navbar from "./Admin_Navbar";
import { useNavigate } from "react-router-dom";

const Admin_Dashboard = () => {
  const { adminInfo } = useSelector((state) => state.admin);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${adminInfo?.token}`,
          },
        };
  
        const [usersRes, salesRes, productsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/analytics/users", config),
          axios.get("http://localhost:5000/api/admin/analytics/sales", config),
          axios.get("http://localhost:5000/api/admin/analytics/products", config),
        ]);
  
        setStats({
          totalUsers: usersRes.data.totalUsers || 0,
          totalSellers: usersRes.data.totalSellers || 0,
          totalProducts: productsRes.data.totalProducts || 0,
          totalRevenue: salesRes.data.totalRevenue || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
  
    if (adminInfo?.token) {
      fetchStats();
    }
  }, [adminInfo]);
  

  return (
    <div className="flex h-screen bg-gray-100">
      <Admin_Sidebar />

      <div className="flex-1 flex flex-col ml-64">
        <Admin_Navbar />

        <div className="flex-1 p-6 mt-15">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold">Welcome to Admin Dashboard</h1>
            <p className="mt-2 text-lg">
              Manage your e-commerce platform with comprehensive tools and insights.
            </p>
            <div className="mt-4">
              <button className="bg-white cursor-pointer text-blue-600 font-semibold px-4 py-2 rounded-lg shadow-md mr-2">
                View System Status
              </button>
              <button className="bg-blue-800 cursor-pointer hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded-lg shadow-md">
                Generate Reports
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {loading ? (
              <p className="col-span-4 text-center text-gray-500">Loading stats...</p>
            ) : (
              <>
                <StatCard title="Total Users" value={stats.totalUsers} change="+124 this month" />
                <StatCard title="Total Sellers" value={stats.totalSellers} change="+18 this month" />
                <StatCard title="Total Products" value={stats.totalProducts} change="+342 this month" />
                <StatCard title="Total Revenue" value={`${stats.totalRevenue.toLocaleString()}`} change="+8.3% from last month" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h2 className="text-gray-600 text-lg font-semibold">{title}</h2>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-green-600 font-medium mt-1">&#x2B06; {change}</p>
    </div>
  );
};

export default Admin_Dashboard;
