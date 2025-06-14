// import { create } from "zustand";
// import axios, { AxiosError, AxiosResponse } from "../lib/axios";
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
// interface UserState {
//   user: User | null;
//   loading: boolean;
//   checkingAuth: boolean;
//   signup: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   checkAuth: () => Promise<void>;
//   refreshToken: () => Promise<string | undefined>;
// }

// // Create the Zustand store with TypeScript
// export const useUserStore = create<UserState>((set, get) => ({
//   user: null,
//   loading: false,
//   checkingAuth: true,

//   signup: async ({ name, email, password, confirmPassword }) => {
//     set({ loading: true });
//     if (password !== confirmPassword) {
//       set({ loading: false });
//       toast.error("Passwords do not match");
//       return;
//     }

//     try {
//       const res: AxiosResponse<{ id: string; name: string; email: string; role: string; provider: string; message: string }> = await axios.post("/auth/signup", {
//         name,
//         email,
//         password,
//       });
//       set({ user: { id: res.data.id, name: res.data.name, email: res.data.email, role: res.data.role, provider: res.data.provider }, loading: false });
//       toast.success(res.data.message);
//     } catch (error) {
//       set({ loading: false });
//       const err = error as AxiosError<{ message?: string }>;
//       toast.error(err.response?.data?.message || "An error occurred during signup");
//     }
//   },

//   login: async (email: string, password: string) => {
//     set({ loading: true });

//     try {
//       const res: AxiosResponse<{ status: string; data: { user: User } }> = await axios.post("/auth/login", { email, password });
//       set({ user: res.data.data.user, loading: false });
//       toast.success("Login successful");
//     } catch (error) {
//       set({ loading: false });
//       const err = error as AxiosError<{ message?: string }>;
//       toast.error(err.response?.data?.message || "An error occurred during login");
//     }
//   },

//   logout: async () => {
//     try {
//       await axios.post("/auth/logout");
//       set({ user: null });
//       toast.success("Logged out successfully");
//     } catch (error) {
//       const err = error as AxiosError<{ message?: string }>;
//       toast.error(err.response?.data?.message || "An error occurred during logout");
//     }
//   },

//   checkAuth: async () => {
//     set({ checkingAuth: true });
//     try {
//       const res: AxiosResponse<{ status: string; data: { user: User } }> = await axios.get("/auth/check-auth");
//       set({ user: res.data.data.user, checkingAuth: false });
//     } catch (error) {
//       set({ checkingAuth: false, user: null });
//       console.error("Check auth error:", error);
//     }
//   },

//   refreshToken: async () => {
//     if (get().checkingAuth) return;

//     set({ checkingAuth: true });
//     try {
//       const res: AxiosResponse<{ status: string; message: string; user: User }> = await axios.post("/auth/refresh-token");
//       set({ checkingAuth: false });
//       return res.data.user; // Note: The backend doesn't return a new token directly; we rely on cookies
//     } catch (error) {
//       set({ user: null, checkingAuth: false });
//       throw error;
//     }
//   },
// }));

// // Axios interceptor for handling token refresh
// let refreshPromise: Promise<string | undefined> | null = null;

// axios.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config;
//     if (!originalRequest) return Promise.reject(error);

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.warn("Access token expired, refreshing...");
//       originalRequest._retry = true;

//       try {
//         if (refreshPromise) {
//           await refreshPromise;
//           return axios(originalRequest);
//         }

//         refreshPromise = useUserStore.getState().refreshToken();
//         await refreshPromise;
//         refreshPromise = null;

//         return axios(originalRequest);
//       } catch (refreshError) {
//         console.error("Token refresh failed:", refreshError);
//         useUserStore.getState().logout();
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

const SignUpPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const { signup, loading } = useUserStore();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signup({ name, email, password, confirmPassword });
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
          Create your account
        </h2>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-100 py-8 px-4 shadow sm:px-10 rounded-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <User className="h-5 w-5 text-black" aria-hidden="true" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-100 rounded-md shadow-sm placeholder-gray-400 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="h-5 w-5 text-black" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-100 rounded-md shadow-sm placeholder-gray-400 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-black" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-100 rounded-md placeholder-gray-400 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-black" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-100 rounded-md placeholder-gray-400 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Loading...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already a member?{" "}
            <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
              Sign in now <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;