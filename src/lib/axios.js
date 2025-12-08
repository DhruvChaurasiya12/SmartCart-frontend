import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://smartcart-ql2r.onrender.com/api/v1",
  withCredentials: true,
});
