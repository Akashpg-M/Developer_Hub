// import { create } from "zustand";
// import axios from "../lib/axios";
// import { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig, isAxiosError } from "axios";
// import { toast } from "react-hot-toast";

// // Extend the AxiosRequestConfig to include _retry
// interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
//   _retry?: boolean;
// }

// // Define the User type based on the backend response
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   provider: string;
// }

// // Define the store's state
// interface UserState {
//   user: User | null;
//   loading: boolean;
//   checkingAuth: boolean;
//   signup: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<boolean>;  // Updated to return Promise<boolean>
//   checkAuth: () => Promise<void>;
//   refreshToken: () => Promise<string | undefined>;
// }

// // Create the Zustand store with TypeScript
// export const useUserStore = create<UserState>((set, get) => ({
//   user: null,
//   loading: false,
//   checkingAuth: true,

//   signup: async ({ name, email, password, confirmPassword }) => {
//     console.log('Starting signup process...');
//     set({ loading: true });
    
//     if (password !== confirmPassword) {
//       const errorMsg = "Passwords do not match";
//       console.error(errorMsg);
//       set({ loading: false });
//       toast.error(errorMsg);
//       throw new Error(errorMsg);
//     }

//     try {
//       console.log('Sending signup request...', { name, email });
//       const res = await axios.post("/auth/signup", { 
//         name, 
//         email, 
//         password 
//       });
      
//       console.log('Signup response:', res.data);
      
//       // Handle the backend response structure
//       if (res.data.status !== 'success' || !res.data.data?.user) {
//         console.error('Unexpected response structure:', res.data);
//         throw new Error(res.data.message || 'Invalid response from server');
//       }
      
//       const { user: userData, accessToken, refreshToken } = res.data.data;
      
//       if (!userData || !userData.id) {
//         console.error('Invalid user data in response:', res.data);
//         throw new Error("Invalid user data received from server");
//       }
      
//       console.log('Setting user data in store:', userData);
//       set({ 
//         user: userData, 
//         loading: false 
//       });
      
//       // Store tokens in localStorage if needed (though they're in cookies)
//       if (accessToken && refreshToken) {
//         localStorage.setItem('accessToken', accessToken);
//         localStorage.setItem('refreshToken', refreshToken);
//       }
      
//       const successMsg = res.data.message || "Signup successful";
//       console.log(successMsg);
//       toast.success(successMsg);
      
//       return userData;
      
//     } catch (error) {
//       console.error('Signup error:', error);
//       set({ loading: false });
      
//       let errorMessage = "An error occurred during signup";
      
//       if (isAxiosError(error)) {
//         errorMessage = error.response?.data?.message || 
//                      error.response?.data?.error || 
//                      error.message || 
//                      "Network error during signup";
//         console.error('Axios error details:', {
//           status: error.response?.status,
//           data: error.response?.data,
//           message: error.message
//         });
//       } else if (error instanceof Error) {
//         errorMessage = error.message;
//       }
      
//       console.error('Displaying error to user:', errorMessage);
//       toast.error(errorMessage);
//       throw new Error(errorMessage);
//     }
//   },

//   login: async (email: string, password: string) => {
//     console.log('Starting login process...');
//     set({ loading: true });

//     try {
//       console.log('Sending login request...', { email });
//       const res = await axios.post("/auth/login", { email, password });
      
//       console.log('Login response:', res.data);
      
//       // Handle the backend response structure
//       if (res.data.status !== 'success' || !res.data.data?.user) {
//         console.error('Unexpected response structure:', res.data);
//         throw new Error(res.data.message || 'Invalid response from server');
//       }
      
//       const { user: userData, accessToken, refreshToken } = res.data.data;
      
//       if (!userData || !userData.id) {
//         console.error('Invalid user data in response:', res.data);
//         throw new Error("Invalid user data received from server");
//       }
      
//       console.log('Setting user data in store:', userData);
//       set({ 
//         user: userData, 
//         loading: false 
//       });
      
//       // Store tokens in localStorage if needed (though they're in cookies)
//       if (accessToken && refreshToken) {
//         localStorage.setItem('accessToken', accessToken);
//         localStorage.setItem('refreshToken', refreshToken);
//       }
      
//       const successMsg = res.data.message || "Login successful";
//       console.log(successMsg);
//       toast.success(successMsg);
      
//       return userData;
      
//     } catch (error) {
//       console.error('Login error:', error);
//       set({ loading: false });
      
//       let errorMessage = "An error occurred during login";
      
//       if (isAxiosError(error)) {
//         errorMessage = error.response?.data?.message || 
//                      error.response?.data?.error || 
//                      error.message || 
//                      "Network error during login";
//         console.error('Axios error details:', {
//           status: error.response?.status,
//           data: error.response?.data,
//           message: error.message
//         });
//       } else if (error instanceof Error) {
//         errorMessage = error.message;
//       }
      
//       console.error('Displaying error to user:', errorMessage);
//       toast.error(errorMessage);
//       throw new Error(errorMessage);
//     }
//   },

//   logout: async () => {
//     try {
//       // Clear any pending requests and refresh state
//       isRefreshing = false;
//       failedQueue = [];
      
//       // Make the logout request to the backend to clear httpOnly cookies
//       try {
//         await axios.post("/auth/logout", {}, { withCredentials: true });
//       } catch (serverError) {
//         console.warn('Logout API call failed, but proceeding with client-side cleanup', serverError);
//         // Continue with client-side cleanup even if server logout fails
//       }
      
//       // Clear the user state
//       set({ 
//         user: null,
//         loading: false,
//         checkingAuth: false 
//       });
      
//       // Clear all auth-related data from storage
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('auth');
//       sessionStorage.clear();
      
//       // Clear any stored cookies that might be set on the client side
//       document.cookie.split(';').forEach(cookie => {
//         const [name] = cookie.trim().split('=');
//         // Clear all auth-related cookies
//         if (name.includes('token') || name.includes('auth') || name.includes('session')) {
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
//         }
//       });
      
//       // Reset axios defaults and clear any cached requests
//       delete axios.defaults.headers.common['Authorization'];
      
//       // Clear any pending requests in the queue
//       processQueue(new Error('User logged out'));
      
//       console.log('Logout successful, user state cleared');
//       toast.success("Logged out successfully");
//       return true;
      
//     } catch (error) {
//       console.error('Logout error:', error);
      
//       // Even if there's an error, ensure we clear the local state
//       set({ 
//         user: null,
//         loading: false,
//         checkingAuth: false 
//       });
      
//       // Clear storage just in case
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('auth');
//       sessionStorage.clear();
      
//       let errorMessage = "An error occurred during logout";
      
//       if (isAxiosError(error)) {
//         errorMessage = error.response?.data?.message || 
//                      error.response?.data?.error || 
//                      error.message || 
//                      "Network error during logout";
//       } else if (error instanceof Error) {
//         errorMessage = error.message;
//       }
      
//       console.error('Logout error details:', errorMessage);
//       toast.error(errorMessage);
//       return false;
//     }
//   },

//   checkAuth: async () => {
//     // Don't check auth if we're already checking
//     if (get().checkingAuth) return;
    
//     set({ checkingAuth: true, loading: true });
//     try {
//       const res = await axios.get("/auth/check-auth");
//       set({ 
//         user: res.data, 
//         checkingAuth: false,
//         loading: false
//       });
//       return res.data;
//     } catch (error: any) {
//       // Clear user and stop loading on any error
//       set({ 
//         user: null, 
//         checkingAuth: false,
//         loading: false 
//       });
//       // Only throw if it's not a 401 (unauthorized)
//       if (error.response?.status !== 401) {
//         console.error('Auth check failed:', error);
//         throw error;
//       }
//       return null;
//     }
//   },
// }));

// // Axios interceptor for handling token refresh
// let isRefreshing = false;
// let failedQueue: Array<() => void> = [];

// const processQueue = (error: any = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom();
//     } else {
//       prom();
//     }
//   });
//   failedQueue = [];
// };

// axios.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as RetryableAxiosRequestConfig;
//     if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
//       return Promise.reject(error);
//     }

//     console.warn("Access token expired, refreshing...");
//     originalRequest._retry = true;

//     if (isRefreshing) {
//       return new Promise((resolve, reject) => {
//         failedQueue.push(() => {
//           axios(originalRequest).then(resolve).catch(reject);
//         });
//       });
//     }

//     isRefreshing = true;

//     try {
//       await useUserStore.getState().refreshToken();
      
//       // Process all queued requests
//       processQueue(null);
      
//       // Retry the original request
//       return axios(originalRequest);
//     } catch (refreshError) {
//       console.error("Token refresh failed:", refreshError);
//       processQueue(refreshError);
      
//       // Only redirect to login if this isn't a login request
//       if (!originalRequest.url?.includes('auth/login') && !originalRequest.url?.includes('auth/signup')) {
//         useUserStore.getState().logout();
//       }
      
//       return Promise.reject(refreshError);
//     } finally {
//       isRefreshing = false;
//     }
//   }
// );



// import { create } from "zustand";
// import axios from "../lib/axios";
// import { type AxiosError, type AxiosResponse, isAxiosError } from "axios";
// import { toast } from "react-hot-toast";

// // Define the User type based on the backend response
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   provider: string;
// }

// // Define the store's state
// interface AuthState {
//   user: User | null;
//   loading: boolean;
//   checkingAuth: boolean;
//   signup: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<boolean>;
//   checkAuth: () => Promise<User | null>;
// }

// // Create the Zustand store with TypeScript
// export const useAuthStore = create<AuthState>((set, get) => ({
//   user: null,
//   loading: false,
//   checkingAuth: true,

//   signup: async ({ name, email, password, confirmPassword }) => {
//     console.log("Starting signup process...");
//     set({ loading: true });

//     if (password !== confirmPassword) {
//       const errorMsg = "Passwords do not match";
//       console.error(errorMsg);
//       set({ loading: false });
//       toast.error(errorMsg);
//       throw new Error(errorMsg);
//     }

//     try {
//       console.log("Sending signup request...", { name, email });
//       const res = await axios.post("/auth/signup", { name, email, password }, { withCredentials: true });

//       console.log("Signup response:", res.data);

//       // Handle the backend response (direct user object)
//       const userData = res.data;

//       if (!userData || !userData.id) {
//         console.error("Invalid user data in response:", res.data);
//         throw new Error("Invalid user data received from server");
//       }

//       console.log("Setting user data in store:", userData);
//       set({ user: userData, loading: false });

//       const successMsg = "Signup successful";
//       console.log(successMsg);
//       toast.success(successMsg);

//     } catch (error) {
//       console.error("Signup error:", error);
//       set({ loading: false });

//       let errorMessage = "An error occurred during signup";

//       if (isAxiosError(error)) {
//         errorMessage = error.response?.data?.message || error.message || "Network error during signup";
//         console.error("Axios error details:", {
//           status: error.response?.status,
//           data: error.response?.data,
//           message: error.message,
//         });
//       } else if (error instanceof Error) {
//         errorMessage = error.message;
//       }

//       console.error("Displaying error to user:", errorMessage);
//       toast.error(errorMessage);
//       throw new Error(errorMessage);
//     }
//   },

//   login: async (email: string, password: string) => {
//     console.log("Starting login process...");
//     set({ loading: true });

//     try {
//       console.log("Sending login request...", { email });
//       const res = await axios.post("/auth/login", { email, password }, { withCredentials: true });

//       console.log("Login response:", res.data);

//       // Handle the backend response (direct user object)
//       const userData = res.data;

//       if (!userData || !userData.id) {
//         console.error("Invalid user data in response:", res.data);
//         throw new Error("Invalid user data received from server");
//       }

//       console.log("Setting user data in store:", userData);
//       set({ user: userData, loading: false });

//       const successMsg = "Login successful";
//       console.log(successMsg);
//       toast.success(successMsg);

//     } catch (error) {
//       console.error("Login error:", error);
//       set({ loading: false });

//       let errorMessage = "An error occurred during login";

//       if (isAxiosError(error)) {
//         errorMessage = error.response?.data?.message || error.message || "Network error during login";
//         console.error("Axios error details:", {
//           status: error.response?.status,
//           data: error.response?.data,
//           message: error.message,
//         });
//       } else if (error instanceof Error) {
//         errorMessage = error.message;
//       }

//       console.error("Displaying error to user:", errorMessage);
//       toast.error(errorMessage);
//       throw new Error(errorMessage);
//     }
//   },

//   logout: async () => {
//     try {
//       console.log("Starting logout process...");
//       await axios.post("/auth/logout", {}, { withCredentials: true });

//       // Clear the user state
//       set({
//         user: null,
//         loading: false,
//         checkingAuth: false,
//       });

//       // Clear any stored client-side data
//       localStorage.removeItem("auth");
//       sessionStorage.clear();

//       console.log("Logout successful, user state cleared");
//       toast.success("Logged out successfully");
//       return true;

//     } catch (error) {
//       console.error("Logout error:", error);

//       // Clear state even if logout fails
//       set({
//         user: null,
//         loading: false,
//         checkingAuth: false,
//       });

//       localStorage.removeItem("auth");
//       sessionStorage.clear();

//       let errorMessage = "An error occurred during logout";

//       if (isAxiosError(error)) {
//         errorMessage = error.response?.data?.message || error.message || "Network error during logout";
//       } else if (error instanceof Error) {
//         errorMessage = error.message;
//       }

//       console.error("Logout error details:", errorMessage);
//       toast.error(errorMessage);
//       return false;
//     }
//   },

//   checkAuth: async () => {
//     const currentState = get();
    
//     // If we already have a user and aren't explicitly checking, return current user
//     if (currentState.user && !currentState.checkingAuth) {
//       console.log('[Auth] User already authenticated, returning cached user');
//       return currentState.user;
//     }
    
//     // If we're already checking, wait for the current check to complete
//     if (currentState.checkingAuth) {
//       console.log('[Auth] Auth check in progress, waiting for result...');
//       return new Promise<User | null>((resolve) => {
//         const unsubscribe = useAuthStore.subscribe(() => {
//           const state = useAuthStore.getState();
//           if (!state.checkingAuth) {
//             resolve(state.user);
//             unsubscribe();
//           }
//         });
//       });
//     }

//     console.log('[Auth] Starting new auth check...');
//     set({ checkingAuth: true, loading: true });
    
//     try {
//       console.log('[Auth] Making request to /auth/check-auth');
//       const res = await axios.get("/auth/check-auth", { 
//         withCredentials: true,
//         timeout: 10000,
//         headers: {
//           'Cache-Control': 'no-cache',
//           'Pragma': 'no-cache'
//         }
//       });
      
//       console.log('[Auth] Auth check response:', {
//         status: res.status,
//         data: res.data,
//         headers: res.headers
//       });

//       // Only update state if the response contains user data
//       if (res.data && res.data.id) {
//         console.log('[Auth] Setting user data in store:', res.data);
//         set({
//           user: res.data,
//           checkingAuth: false,
//           loading: false,
//         });
//         return res.data;
//       } else {
//         console.warn('[Auth] No valid user data in auth check response');
//         set({ 
//           user: null, 
//           checkingAuth: false, 
//           loading: false 
//         });
//         return null;
//       }

//     } catch (error) {
//       console.error("Auth check failed:", error);
      
//       // Reset auth state on error
//       set({
//         user: null,
//         checkingAuth: false,
//         loading: false,
//       });

//       // Only throw if it's not a 401 (unauthorized)
//       if (isAxiosError(error)) {
//         if (error.response?.status !== 401) {
//           const errorMessage = error.response?.data?.message || 
//                             error.message || 
//                             "Error checking authentication";
//           console.error("Auth check error details:", errorMessage);
//           throw new Error(errorMessage);
//         }
//       } else {
//         console.error("Non-Axios error during auth check:", error);
//         throw error;
//       }
//     }
//   },
// }));

// // Axios interceptor for handling 401 errors
// axios.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       console.warn("Unauthorized, clearing user state...");
//       useAuthStore.getState().logout();
//     }

//     return Promise.reject(error);
//   }
// );


// import { create } from "zustand";
// import axios from "../lib/axios";
// import { toast } from "react-hot-toast";
// import { AxiosError } from "axios";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   provider: string;
// }

// interface AuthState {
//   user: User | null;
//   loading: boolean;
//   checkingAuth: boolean;
//   signup: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<boolean>;
//   checkAuth: () => Promise<User | null>;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   loading: false,
//   checkingAuth: false,

//   signup: async ({ name, email, password, confirmPassword }) => {
//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       throw new Error("Passwords do not match");
//     }

//     set({ loading: true });
//     try {
//       const res = await axios.post("/auth/signup", { name, email, password }, { withCredentials: true });
//       const userData = res.data;
//       if (!userData?.id) throw new Error("Invalid user data");

//       set({ user: userData, loading: false });
//       toast.success("Signup successful");
//     } catch (error) {
//       set({ loading: false });
//       const message = error instanceof AxiosError
//         ? error.response?.data?.message || "Signup failed"
//         : "An error occurred";
//       toast.error(message);
//       throw new Error(message);
//     }
//   },

//   login: async (email, password) => {
//     set({ loading: true });
//     try {
//       const res = await axios.post("/auth/login", { email, password }, { withCredentials: true });
//       const userData = res.data;
//       if (!userData?.id) throw new Error("Invalid user data");

//       set({ user: userData, loading: false });
//       toast.success("Login successful");
//     } catch (error) {
//       set({ loading: false });
//       const message = error instanceof AxiosError
//         ? error.response?.data?.message || "Login failed"
//         : "An error occurred";
//       toast.error(message);
//       throw new Error(message);
//     }
//   },

//   logout: async () => {
//     try {
//       await axios.post("/auth/logout", {}, { withCredentials: true });
//       set({ user: null, loading: false, checkingAuth: false });
//       localStorage.clear();
//       sessionStorage.clear();
//       toast.success("Logged out successfully");
//       return true;
//     } catch (error) {
//       set({ user: null, loading: false, checkingAuth: false });
//       localStorage.clear();
//       sessionStorage.clear();
//       const message = error instanceof AxiosError
//         ? error.response?.data?.message || "Logout failed"
//         : "An error occurred";
//       toast.error(message);
//       return false;
//     }
//   },

//   checkAuth: async () => {
//     set({ checkingAuth: true });
//     try {
//       const res = await axios.get("/auth/check-auth", { withCredentials: true });
//       const userData = res.data;
//       set({ user: userData?.id ? userData : null, checkingAuth: false });
//       return userData?.id ? userData : null;
//     } catch (error) {
//       set({ user: null, checkingAuth: false });
//       if (error instanceof AxiosError && error.response?.status !== 401) {
//         toast.error(error.response?.data?.message || "Error checking authentication");
//       }
//       return null;
//     }
//   },
// }));

// import { create } from "zustand";
// import axios from "../lib/axios";
// import { toast } from "react-hot-toast";
// import { AxiosError } from "axios";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   provider: string;
// }

// interface AuthState {
//   user: User | null;
//   loading: boolean;
//   checkingAuth: boolean;
//   signup: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<boolean>;
//   checkAuth: () => Promise<User | null>;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   loading: false,
//   checkingAuth: false,

//   signup: async ({ name, email, password, confirmPassword }) => {
//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       throw new Error("Passwords do not match");
//     }

//     set({ loading: true });
//     try {
//       const res = await axios.post("/auth/signup", { name, email, password }, { withCredentials: true });
//       const userData = res.data;
//       if (!userData?.id) {
//         throw new Error("Invalid user data received from server");
//       }

//       set({ user: userData, loading: false });
//       toast.success("Signup successful");
//     } catch (error) {
//       set({ loading: false });
//       const message = error instanceof AxiosError
//         ? error.response?.data?.message || "Signup failed"
//         : "An unexpected error occurred";
//       toast.error(message);
//       throw new Error(message);
//     }
//   },

//   login: async (email, password) => {
//     set({ loading: true });
//     try {
//       const res = await axios.post("/auth/login", { email, password }, { withCredentials: true });
//       const userData = res.data;
//       if (!userData?.id) {
//         throw new Error("Invalid user data received from server");
//       }

//       set({ user: userData, loading: false });
//       toast.success("Login successful");
//     } catch (error) {
//       set({ loading: false });
//       const message = error instanceof AxiosError
//         ? error.response?.data?.message || "Login failed"
//         : "An unexpected error occurred";
//       toast.error(message);
//       throw new Error(message);
//     }
//   },

//   logout: async () => {
//     try {
//       await axios.post("/auth/logout", {}, { withCredentials: true });
//       set({ user: null, loading: false, checkingAuth: false });
//       localStorage.removeItem("auth"); // Clear only auth-related storage
//       sessionStorage.clear();
//       toast.success("Logged out successfully");
//       return true;
//     } catch (error) {
//       set({ user: null, loading: false, checkingAuth: false });
//       localStorage.removeItem("auth");
//       sessionStorage.clear();
//       const message = error instanceof AxiosError
//         ? error.response?.data?.message || "Logout failed"
//         : "An unexpected error occurred";
//       toast.error(message);
//       return false;
//     }
//   },

//   checkAuth: async () => {
//     set({ checkingAuth: true });
//     try {
//       const res = await axios.get("/auth/check-auth", { withCredentials: true });
//       const userData = res.data;
//       set({ user: userData?.id ? userData : null, checkingAuth: false });
//       return userData?.id ? userData : null;
//     } catch (error) {
//       set({ user: null, checkingAuth: false });
//       if (error instanceof AxiosError && error.response?.status !== 401) {
//         const message = error.response?.data?.message || "Error checking authentication";
//         toast.error(message);
//       }
//       return null;
//     }
//   },
// }));

import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  provider: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  checkingAuth: boolean;
  isCheckingAuthLocked: boolean; // Prevent concurrent checkAuth
  signup: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<boolean>;
  checkAuth: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: false,
  isCheckingAuthLocked: false,

  signup: async ({ name, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      throw new Error("Passwords do not match");
    }

    set({ loading: true });
    try {
      const res = await axios.post("/auth/signup", { name, email, password }, { withCredentials: true });
      const userData = res.data;
      if (!userData?.id) throw new Error("Invalid user data");

      set({ user: userData, loading: false });
      toast.success("Signup successful");
    } catch (error) {
      set({ loading: false });
      const message = error instanceof AxiosError
        ? error.response?.data?.message || "Signup failed"
        : "An error occurred";
      toast.error(message);
      throw new Error(message);
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/login", { email, password }, { withCredentials: true });
      const userData = res.data;
      if (!userData?.id) throw new Error("Invalid user data");

      set({ user: userData, loading: false });
      toast.success("Login successful");
    } catch (error) {
      set({ loading: false });
      const message = error instanceof AxiosError
        ? error.response?.data?.message || "Login failed"
        : "An error occurred";
      toast.error(message);
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      set({ user: null, loading: false, checkingAuth: false });
      localStorage.removeItem("auth");
      sessionStorage.clear();
      toast.success("Logged out successfully");
      return true;
    } catch (error) {
      set({ user: null, loading: false, checkingAuth: false });
      localStorage.removeItem("auth");
      sessionStorage.clear();
      const message = error instanceof AxiosError
        ? error.response?.data?.message || "Logout failed"
        : "An error occurred";
      toast.error(message);
      return false;
    }
  },

  checkAuth: async () => {
    const { isCheckingAuthLocked, checkingAuth } = get();
    if (isCheckingAuthLocked || checkingAuth) return null; // Prevent concurrent calls

    set({ checkingAuth: true, isCheckingAuthLocked: true });
    try {
      const res = await axios.get("/auth/check-auth", { withCredentials: true });
      const userData = res.data;
      set({ user: userData?.id ? userData : null, checkingAuth: false, isCheckingAuthLocked: false });
      return userData?.id ? userData : null;
    } catch (error) {
      set({ user: null, checkingAuth: false, isCheckingAuthLocked: false });
      return null;
    }
  },
}));