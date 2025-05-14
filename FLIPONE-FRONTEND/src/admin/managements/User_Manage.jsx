import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Admin_Sidebar from "../pages/Admin_Sidebar";
import Admin_Navbar from "../pages/Admin_Navbar";
import { MdOutlineDeleteForever } from "react-icons/md";
import Switcher2 from "../managements/Switcher"; // Make sure the path is correct

const User_Manage = () => {
  const { adminInfo } = useSelector((state) => state.admin);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Set how many users per page
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/admin/allUsers`, {
          headers: {
            Authorization: `Bearer ${adminInfo?.token}`,
          },
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (adminInfo?.token) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [adminInfo]);

  // Toggle User Active/Inactive
  const toggleUserStatus = async (id, isActive) => {
    const confirmToggle = window.confirm(
      `Are you sure you want to ${isActive ? "deactivate" : "activate"} this user?`
    );
    if (!confirmToggle) return;

    try {
      const endpoint = `${BASE_URL}/api/admin/users/${id}/toggle-status`;

      await axios.patch(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${adminInfo?.token}`,
        },
      });

      // Update UI
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, isActive: !isActive } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status.");
    }
  };

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          <h1 className="text-2xl font-bold mb-6 text-gray-800">User Management</h1>

          {loading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : (
            <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    {/* <th className="px-6 py-3">Actions</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 capitalize">{user.role}</td>
                      <td className="px-6 py-4">
                        <Switcher2
                          isChecked={user.isActive}
                          onToggle={() => toggleUserStatus(user._id, user.isActive)}
                        />
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          className="text-red-600 hover:underline cursor-pointer"
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          {/* <MdOutlineDeleteForever className="h-4 w-4" /> */}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-6">
            <button
              onClick={() => paginate(currentPage - 1)}
              className="px-4 py-2 border border-gray-300 rounded-l-lg bg-white hover:bg-gray-100"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              className="px-4 py-2 border border-gray-300 rounded-r-lg bg-white hover:bg-gray-100"
              disabled={currentPage === Math.ceil(users.length / usersPerPage)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Manage;
