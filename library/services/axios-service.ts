// lib/axios.ts
import axios from "axios";
import { backendBaseURL } from "@/library/consts/app-constants";

const httpMethod = axios.create({
  baseURL: backendBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Giữ lại interceptor phản hồi để xử lý lỗi chung
httpMethod.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Có lỗi xảy ra, vui lòng thử lại";

    console.log("API Error:", errorMsg);
    return Promise.reject(error.response?.data || error);
  }
);

export default httpMethod;
