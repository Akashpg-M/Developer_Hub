import { create } from "zustand";
import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "../lib/axios";
import { toast } from "react-hot-toast";

// Extend the AxiosRequestConfig to include _retry
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Define the User type based on the backend response
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  provider: string;
}

// Define the store's state
interface UserState {
  user: User | null;
  loading: boolean;
  checkingAuth: boolean;
  signup: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<boolean>;  // Updated to return Promise<boolean>
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<string | undefined>;
}

// Create the Zustand store with TypeScript
export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });
    if (password !== confirmPassword) {
      set({ loading: false });
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      set({ 
        user: res.data.user, 
        loading: false 
      });
      toast.success("Signup successful");
    } catch (error) {
      set({ loading: false });
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "An error occurred during signup");
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });
      set({ 
        user: res.data.user, 
        loading: false 
      });
      toast.success("Login successful");
    } catch (error) {
      set({ loading: false });
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "An error occurred during login");
    }
  },

  logout: async () => {
    try {
      // Clear any pending requests
      isRefreshing = false;
      failedQueue = [];
      
      // Make the logout request
      await axios.post("/auth/logout", {}, { withCredentials: true });
      
      // Clear the user state
      set({ 
        user: null,
        loading: false,
        checkingAuth: false 
      });
      
      // Clear any stored tokens or auth data
      localStorage.removeItem('auth');
      sessionStorage.removeItem('auth');
      
      // Reset axios defaults
      axios.defaults.headers.common['Authorization'] = '';
      
      toast.success("Logged out successfully");
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the request fails, we should still clear the local state
      set({ 
        user: null,
        loading: false,
        checkingAuth: false 
      });
      
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || "An error occurred during logout";
      toast.error(errorMessage);
      return false;
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axios.get("/auth/check-auth");
      set({ 
        user: res.data.user, 
        checkingAuth: false 
      });
    } catch (error) {
      set({ checkingAuth: false, user: null });
      console.error("Check auth error:", error);
    }
  },

  refreshToken: async (): Promise<string | undefined> => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const res = await axios.post("/auth/refresh-token");
      set({ 
        user: res.data.user, 
        checkingAuth: false 
      });
      return res.data.user?.id;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}));

// Axios interceptor for handling token refresh
let isRefreshing = false;
let failedQueue: Array<() => void> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom();
    } else {
      prom();
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    console.warn("Access token expired, refreshing...");
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push(() => {
          axios(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    isRefreshing = true;

    try {
      await useUserStore.getState().refreshToken();
      
      // Process all queued requests
      processQueue(null);
      
      // Retry the original request
      return axios(originalRequest);
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      processQueue(refreshError);
      
      // Only redirect to login if this isn't a login request
      if (!originalRequest.url?.includes('auth/login') && !originalRequest.url?.includes('auth/signup')) {
        useUserStore.getState().logout();
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

