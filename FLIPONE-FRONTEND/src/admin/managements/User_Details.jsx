// src/components/admin/UserDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Admin_Sidebar from "../pages/Admin_Sidebar";
import Admin_Navbar from "../pages/Admin_Navbar";
import { useSelector } from "react-redux";
import Switcher2 from "../managements/Switcher"; // adjust path if needed

const User_Details = () => {
  const { id } = useParams();
  const { adminInfo } = useSelector((state) => state.admin);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/allUsers/${id}`, {
          headers: {
            Authorization: `Bearer ${adminInfo?.token}`,
          },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (adminInfo?.token) {
      fetchUserDetails();
    }
  }, [id, adminInfo]);

  const handleStatusToggle = async () => {
    if (!user) return;

    const confirmChange = window.confirm(
      `Are you sure you want to ${user.isActive ? "deactivate" : "activate"} this user?`
    );
    if (!confirmChange) return;

    try {
      await axios.patch(
        `${BASE_URL}/api/admin/users/${id}/toggle-status`, // update path if needed
        {},
        {
          headers: {
            Authorization: `Bearer ${adminInfo?.token}`,
          },
        }
      );

      setUser((prev) => ({ ...prev, isActive: !prev.isActive }));
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Error updating user status.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 fixed h-full bg-white shadow z-10">
        <Admin_Sidebar />
      </div>

      <div className="flex-1 ml-64">
        <div className="sticky top-0 z-20 bg-white shadow">
          <Admin_Navbar />
        </div>

        <div className="p-6 pt-24">
          <h1 className="text-2xl font-bold mb-4">User Details</h1>
          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <div className="bg-white p-6 shadow rounded-lg space-y-4">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <div className="flex items-center gap-4">
                <strong>Status:</strong>
                <Switcher2 isChecked={user.isActive} onToggle={handleStatusToggle} />
                <span className={`text-sm font-medium ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p><strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-red-500">User not found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default User_Details;
