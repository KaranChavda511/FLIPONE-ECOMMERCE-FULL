import React from "react";
import {
  FaUserFriends,
  FaCartPlus,
  FaCubes,
  FaClipboardList,
  FaChartBar,
} from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutSeller } from "../../../redux/sellarSlice";

const Selar_Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutSeller()); // ✅ call slice reducer to clear seller data
    navigate("/selar_login"); // Redirect to login page
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-lg font-bold text-gray-900">Seller Portal</h1>
          <p className="text-sm text-gray-500">Premium Seller</p>
        </div>
        <hr className="mb-4" />

        <ul className="text-gray-800">
          <SidebarItem
            Icon={FaChartBar}
            text="Dashboard"
            active
            onClick={() => navigate("/Selar_Dashboard")}
          />
          <SidebarItem
            Icon={FaCubes}
            text="Products"
            onClick={() => navigate("/Selar_Products")}
          />
          <SidebarItem Icon={FaCartPlus} text="Orders" 
                      onClick={() => navigate("/orders")}

          />
        </ul>
      </div>

      {/* Logout Button */}
      <div>
        <SidebarItem
          onClick={handleLogout}
          Icon={IoLogOut}
          text="Logout"
          customClass="text-red-600 hover:bg-red-500"
        />
      </div>
    </div>
  );
};

const SidebarItem = ({ Icon, text, active, customClass = "", onClick }) => {
  return (
    <li
      onClick={onClick}
      className={`mb-3 px-4 py-3 flex items-center rounded-lg cursor-pointer transition-all hover:bg-blue-500 hover:text-white ${
        active ? "bg-blue-100 text-blue-600" : ""
      } ${customClass}`}
    >
      <Icon className="mr-3" size={20} /> {text}
    </li>
  );
};

export default Selar_Sidebar;
