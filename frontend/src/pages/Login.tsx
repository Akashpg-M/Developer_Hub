
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";

// const LoginPage = () => {
// 	const [email, setEmail] = useState("");
// 	const [password, setPassword] = useState("");

// 	const { login, loading } = useAuthStore();

// 	const handleSubmit = (e) => {
// 		e.preventDefault();
// 		console.log(email, password);
// 		login(email, password);
// 	};

// 	return (
// 		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
// 			<div
// 				className='sm:mx-auto sm:w-full sm:max-w-md'
// 				initial={{ opacity: 0, y: -20 }}
// 				animate={{ opacity: 1, y: 0 }}
// 				transition={{ duration: 0.8 }}
// 			>
// 				<h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>Create your account</h2>
// 			</div>

// 			<div
// 				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
// 				initial={{ opacity: 0, y: 20 }}
// 				animate={{ opacity: 1, y: 0 }}
// 				transition={{ duration: 0.8, delay: 0.2 }}
// 			>
// 				<div className='bg-gray-100 py-8 px-4 shadow sm:px-10 rounded-md'>
// 					<form onSubmit={handleSubmit} className='space-y-6'>
// 						<div>
// 							<label htmlFor='email' className='block text-sm font-medium text-black'>
// 								Email address
// 							</label>
// 							<div className='mt-1 relative rounded-md shadow-sm'>
// 								<div className='absolute inset-y-0 left-0 pl-3 flex items-center '>
// 									<Mail className='h-5 w-5 text-black' aria-hidden='true' />
// 								</div>
// 								<input
// 									id='email'
// 									type='email'
// 									required
// 									value={email}
// 									onChange={(e) => setEmail(e.target.value)}
// 									className=' block w-full px-3 py-2 pl-10  bg-gray-100 border border-gray-100 
// 									rounded-md shadow-sm
// 									 placeholder-gray-400 focus:outline-none'
// 									placeholder='you@example.com'
// 								/>
// 							</div>
// 						</div>

// 						<div>
// 							<label htmlFor='password' className='block text-sm font-medium  text-black'>
// 								Password
// 							</label>
// 							<div className='mt-1 relative rounded-md shadow-sm'>
// 								<div className='absolute inset-y-0 left-0 pl-3 flex items-center '>
// 									<Lock className='h-5 w-5  text-black' aria-hidden='true' />
// 								</div>
// 								<input
// 									id='password'
// 									type='password'
// 									required
// 									value={password}
// 									onChange={(e) => setPassword(e.target.value)}
// 									className=' block w-full px-3 py-2 pl-10 bg-gray-100 border border-gray-100
// 									rounded-md  placeholder-gray-400 '
// 									placeholder='••••••••'
// 								/>
// 							</div>
// 						</div>

// 						<button
// 							type='submit'
// 							className='w-full flex justify-center py-2 px-4 border  
// 							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
// 							 hover:bg-emerald-700 '
// 							disabled={loading}
// 						>
// 							{loading ? (
// 								<>
// 									<Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
// 									Loading...
// 								</>
// 							) : (
// 								<>
// 									<LogIn className='mr-2 h-5 w-5' aria-hidden='true' />
// 									Login
// 								</>
// 							)}
// 						</button>
// 					</form>

// 					<p className='mt-8 text-center text-sm text-gray-400'>
// 						Not a member?{" "}
// 						<Link to='/signup' className='font-medium text-emerald-400 hover:text-emerald-300'>
// 							Sign up now <ArrowRight className='inline h-4 w-4' />
// 						</Link>
// 					</p>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };
// export default LoginPage;

// import { motion } from 'framer-motion';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { LogIn, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
// import { z } from 'zod';
// import { useAuthStore } from '../store/useAuthStore';
// import { showApiErrorToast } from '../lib/apiErrorHandler';
// import useForm from '../hooks/useForm';

// // Define validation schema
// const loginSchema = z.object({
//   email: z.string().email('Please enter a valid email address'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
// });

// type LoginFormData = z.infer<typeof loginSchema>;

// const LoginPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login } = useAuthStore();
  
//   // Initialize form with useForm hook
//   const {
//     values,
//     errors,
//     touched,
//     isSubmitting,
//     isValid,
//     handleChange,
//     handleBlur,
//     handleSubmit: submitForm,
//   } = useForm<LoginFormData>(
//     { email: '', password: '' },
//     loginSchema
//   );

//   const handleLogin = async (formData: LoginFormData) => {
//     try {
//       await login(formData.email, formData.password);
//       // Redirect to the previous page or home
//       const from = (location.state as { from?: Location })?.from?.pathname || '/';
//       navigate(from, { replace: true });
//     } catch (error) {
//       showApiErrorToast(error);
//       throw error; // Re-throw to let the form know submission failed
//     }
//   };

//   const onSubmit = () => submitForm(handleLogin);

//   return (
//     <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div
//         className="sm:mx-auto sm:w-full sm:max-w-md"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         <h2 className="text-center text-3xl font-extrabold text-emerald-400">
//           Sign in to your account
//         </h2>
//       </div>

//       <div
//         className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, delay: 0.2 }}
//       >
//         <div className="bg-gray-100 py-8 px-4 shadow sm:px-10 rounded-md">
//           <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
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
//                   value={values.email}
//                   onChange={(e) => handleChange('email', e.target.value)}
//                   onBlur={() => handleBlur('email')}
//                   className={`block w-full px-3 py-2 pl-10 bg-gray-100 border ${
//                     touched.email && errors.email ? 'border-red-500' : 'border-gray-100'
//                   } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
//                   placeholder="you@example.com"
//                   autoComplete="email"
//                 />
//               </div>
//               {touched.email && errors.email && (
//                 <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//               )}
//             </div>

//             <div>
//               <div className="flex items-center justify-between">
//                 <label htmlFor="password" className="block text-sm font-medium text-black">
//                   Password
//                 </label>
//                 <div className="text-sm">
//                   <Link 
//                     to="/forgot-password" 
//                     className="font-medium text-emerald-400 hover:text-emerald-300"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//               </div>
//               <div className="mt-1 relative rounded-md shadow-sm">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
//                   <Lock className="h-5 w-5 text-black" aria-hidden="true" />
//                 </div>
//                 <input
//                   id="password"
//                   type="password"
//                   required
//                   value={values.password}
//                   onChange={(e) => handleChange('password', e.target.value)}
//                   onBlur={() => handleBlur('password')}
//                   className={`block w-full px-3 py-2 pl-10 bg-gray-100 border ${
//                     touched.password && errors.password ? 'border-red-500' : 'border-gray-100'
//                   } rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
//                   placeholder="••••••••"
//                   autoComplete="current-password"
//                 />
//               </div>
//               {touched.password && errors.password && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password}</p>
//               )}
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={isSubmitting || !isValid}
//                 className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
//                   isSubmitting || !isValid
//                     ? 'bg-emerald-400 cursor-not-allowed'
//                     : 'bg-emerald-600 hover:bg-emerald-700'
//                 } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
//                     Signing in...
//                   </>
//                 ) : (
//                   <>
//                     <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
//                     Sign in
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>

//           <div className="mt-6">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300" />
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-gray-100 text-gray-500">
//                   Or continue with
//                 </span>
//               </div>
//             </div>

//             <div className="mt-6 grid grid-cols-1 gap-3">
//               <div>
//                 <a
//                   href="/api/auth/google"
//                   className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
//                 >
//                   <span className="sr-only">Sign in with Google</span>
//                   <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
//                   </svg>
//                 </a>
//               </div>
//             </div>
//           </div>

//           <p className="mt-8 text-center text-sm text-gray-400">
//             Not a member?{" "}
//             <Link 
//               to="/signup" 
//               className="font-medium text-emerald-400 hover:text-emerald-300"
//               state={{ from: location.state?.from }}
//             >
//               Sign up now <ArrowRight className="inline h-4 w-4" />
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import { showApiErrorToast } from '../lib/apiErrorHandler';
import useForm from '../hooks/useForm';

// Define validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  
  // Initialize form with useForm hook
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit: submitForm,
  } = useForm<LoginFormData>(
    { email: '', password: '' },
    loginSchema
  );

  const handleLogin = async (formData: LoginFormData) => {
    try {
      await login(formData.email, formData.password);
      // Redirect to the previous page or home
      const from = (location.state as { from?: Location })?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      showApiErrorToast(error);
      throw error; // Re-throw to let the form know submission failed
    }
  };

  const onSubmit = () => submitForm(handleLogin);

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-indigo-50">
      <div>
        <h2 className="text-center text-3xl font-extrabold text-indigo-900">
          Sign in to your account
        </h2>
      </div>

      <div>
        <div className="bg-white py-8 px-4 shadow-lg sm:px-10 rounded-lg">
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
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
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`block w-full px-3 py-2 pl-10 bg-white border ${
                    touched.email && errors.email ? 'border-red-500' : 'border-indigo-200'
                  } rounded-md shadow-sm placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-indigo-900">
                  Password
                </label>
                <div className="text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`block w-full px-3 py-2 pl-10 bg-white border ${
                    touched.password && errors.password ? 'border-red-500' : 'border-indigo-200'
                  } rounded-md placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting || !isValid
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                    Sign in
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-indigo-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-indigo-600">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <a
                  href="/api/auth/google"
                  className="w-full inline-flex justify-center py-2 px-4 border border-indigo-200 rounded-md shadow-sm bg-white text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-indigo-600">
            Not a member?{" "}
            <Link 
              to="/signup" 
              className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
              state={{ from: location.state?.from }}
            >
              Sign up now <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;