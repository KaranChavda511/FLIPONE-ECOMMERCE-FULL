// pages/Seller_Manage.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Admin_Sidebar from "../pages/Admin_Sidebar";
import Admin_Navbar from "../pages/Admin_Navbar";
import { MdOutlineDeleteForever } from "react-icons/md";
import Switcher2 from "../managements/Switcher";

const Seller_Manage = () => {
  const { adminInfo } = useSelector((state) => state.admin);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/admin/allSellers`, {
          headers: {
            Authorization: `Bearer ${adminInfo?.token}`,
          },
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });

        setUsers(response?.data?.sellers ?? []);
        setTotalPages(Math.ceil((response?.data?.total || 0) / itemsPerPage));
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
  }, [adminInfo, currentPage]);

  const toggleUserStatus = async (id, isActive) => {
    const confirmToggle = window.confirm(
      // `Are you sure you want to ${isActive ? "deactivate" : "activate"} this seller?`
    );
    if (!confirmToggle) return;

    try {
      const endpoint = `${BASE_URL}/api/admin/sellers/${id}/toggle-status`;

      await axios.patch(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminInfo?.token}`,
          },
        }
      );

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

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 fixed h-full bg-white shadow z-10">
        <Admin_Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Navbar */}
        <div className="sticky top-0 z-10 bg-white shadow">
          <Admin_Navbar />
        </div>

        {/* Content */}
        <div className="p-6 pt-24">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Seller Management</h1>

          <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
            {loading ? (
              <p className="p-4">Loading users...</p>
            ) : !Array.isArray(users) || users.length === 0 ? (
              <p className="p-4">No users found.</p>
            ) : (
              <>
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
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {user.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email || "N/A"}</td>
                        <td className="px-6 py-4 capitalize">{user.role || "Seller"}</td>
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
                            {/* <MdOutlineDeleteForever className="h-5 w-5" /> */}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center mt-4 gap-2">
                  <button
                    className="px-3 py-1 border rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    className="px-3 py-1 border rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seller_Manage;
