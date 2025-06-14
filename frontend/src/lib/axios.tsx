// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
//   withCredentials: true, // Allows sending cookies in requests by default
// });

// export default axiosInstance;

import axios, { AxiosError, type AxiosResponse, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api",
  withCredentials: true, // Allows sending cookies in requests by default
});

// Export named exports for AxiosError and AxiosResponse
export { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig };

// Export the axios instance as default
export default axiosInstance;