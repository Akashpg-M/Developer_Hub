// import { useState, type FormEvent } from "react";
// import { motion } from "framer-motion";
// import { Link, useNavigate } from "react-router-dom";
// import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";

// const SignUpPage: React.FC = () => {
//   const [name, setName] = useState<string>("");
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [confirmPassword, setConfirmPassword] = useState<string>("");

//   const { signup, loading } = useAuthStore();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     try {
//       await signup({ name, email, password, confirmPassword });
//       // Navigate to home page after successful signup
//       navigate('/');
//     } catch (error) {
//       // Error is already handled in the store
//       console.error('Signup error:', error);
//     }
//   };

//   return (
//     <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div
//         className="sm:mx-auto sm:w-full sm:max-w-md"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
//           Create your account
//         </h2>
//       </div>

//       <div
//         className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, delay: 0.2 }}
//       >
//         <div className="bg-gray-100 py-8 px-4 shadow sm:px-10 rounded-md">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-black">
//                 Full Name
//               </label>
//               <div className="mt-1 relative rounded-md shadow-sm">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
//                   <User className="h-5 w-5 text-black" aria-hidden="true" />
//                 </div>
//                 <input
//                   id="name"
//                   type="text"
//                   required
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-100 rounded-md shadow-sm placeholder-gray-400 focus:outline-none"
//                   placeholder="John Doe"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-black">
//                 Email address
//               </label>
//               <div className="mt-1 relative rounded-md shadow-sm">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
//                   <Mail className="h-5 w-5 text-black" aria-hidden="true" />
//                 </div>
//                 <input
//                   id="email"
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-100 rounded-md shadow-sm placeholder-gray-400 focus:outline-none"
//                   placeholder="you@example.com"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-black">
//                 Password
//               </label>
//               <div className="mt-1 relative rounded-md shadow-sm">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
//                   <Lock className="h-5 w-5 text-black" aria-hidden="true" />
//                 </div>
//                 <input
//                   id="password"
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-100 rounded-md placeholder-gray-400 focus:outline-none"
//                   placeholder="••••••••"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
//                 Confirm Password
//               </label>
//               <div className="mt-1 relative rounded-md shadow-sm">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
//                   <Lock className="h-5 w-5 text-black" aria-hidden="true" />
//                 </div>
//                 <input
//                   id="confirmPassword"
//                   type="password"
//                   required
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-100 rounded-md placeholder-gray-400 focus:outline-none"
//                   placeholder="••••••••"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
//                   Loading...
//                 </>
//               ) : (
//                 <>
//                   <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
//                   Sign Up
//                 </>
//               )}
//             </button>
//           </form>

//           <p className="mt-8 text-center text-sm text-gray-400">
//             Already a member?{" "}
//             <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
//               Sign in now <ArrowRight className="inline h-4 w-4" />
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUpPage;

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const SignUpPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signup({ name, email, password, confirmPassword });
      // Navigate to home page after successful signup
      navigate('/');
    } catch (error) {
      // Error is already handled in the store
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-indigo-50">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-900">
          Create your account
        </h2>
      </div>

      <div>
        <div className="bg-white py-8 px-4 shadow-lg sm:px-10 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-indigo-900">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <User className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 bg-white border border-indigo-200 rounded-md shadow-sm placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-indigo-900">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 bg-white border border-indigo-200 rounded-md shadow-sm placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-indigo-900">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 bg-white border border-indigo-200 rounded-md placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-900">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 bg-white border border-indigo-200 rounded-md placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200'
              }`}
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

          <p className="mt-8 text-center text-sm text-indigo-600">
            Already a member?{" "}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
              Sign in now <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;