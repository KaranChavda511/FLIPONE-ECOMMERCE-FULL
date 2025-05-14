import axios from "axios";
import { API } from "./Api";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${BASE_URL}`;

const DataServices = () => {
  const token = localStorage.getItem("token");
  console.log("Token inside DataServices:", token);  

  return axios.create({
    baseURL: API_ENDPOINT,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "", 
    },
  });
};

// API functions
export const loginAdmin = (data) => DataServices().post(API.ADMINLOGIN, data);
export const userSignup = (data) => DataServices().post(API.USERREGISTER, data);
export const registerSeller = (data) => DataServices().post(API.SELLERREGISTER, data);
export const loginUser = (data) => DataServices().post(API.USERLOGIN, data);
export const loginSeller = (data) => DataServices().post(API.SELLERLOGIN, data);

export default DataServices;
