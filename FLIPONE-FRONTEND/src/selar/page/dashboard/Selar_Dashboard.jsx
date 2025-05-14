import React from "react";
import Selar_Navbar from "./Selar_Navbar";
import Selar_Sidebar from "./Selar_Sidebar"
import { useNavigate } from "react-router-dom";

const Selar_Dashboard = () => {
  const navigate = useNavigate()
  return (
    <div className="flex h-screen bg-gray-100">

      <Selar_Sidebar />


      <div className="flex-1 flex flex-col ml-64">
        <Selar_Navbar />

        <div className="flex-1 p-6 mt-15">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold">Welcome back Sellar</h1>
            <p className="mt-2 text-lg">
              Your shop is performing well ! Here's your daily overview 
            </p>
            <div className="mt-4">
              <button className="bg-white cursor-pointer text-blue-600 font-semibold px-4 py-2 rounded-lg shadow-md mr-2" onClick={() => navigate("/Selar_Products")}>
                Add New Product 
              </button>
              <button className="bg-blue-800 cursor-pointer hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded-lg shadow-md" onClick={() => navigate ("/Selar_Products")}>
                View Store Products
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <StatCard title="Today's Sales" value="$1254" change="+12% from yesterday" />
            <StatCard title="Orders" value="24" change="5 New since yesterday" />
            <StatCard title="Visitors" value="847" change="+18% from last week" />
            <StatCard title="Conversion Rate" value="2.8%" change="! Could improve" />
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

export default Selar_Dashboard;
