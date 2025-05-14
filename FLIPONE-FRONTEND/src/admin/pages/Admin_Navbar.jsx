import React from "react";
import { useNavigate } from "react-router-dom";

const Admin_Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-64 right-0 bg-white shadow-md py-4 px-6 flex justify-between items-center z-50">
      <div className="flex items-center ml-auto">
        <div
          className="w-10 h-10 bg-gray-300 rounded-full border-2 border-gray-400 cursor-pointer flex items-center justify-center text-gray-800 font-bold text-lg"
          onClick={() => navigate('/admin_profile')}
        >
          A
        </div>
      </div>
    </div>
  );
};

export default Admin_Navbar;
