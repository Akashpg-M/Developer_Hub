
// const HomePage = () => {
//   return(
//     <div className='relative min-h-screen text-black overflow-hidden'>
//       <div className='relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-16'>
//         <h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
//           urProfile
//         </h1>
//         <p className='text-center text-xl text-gray-300 mb-12'>
//         Welcome
//         </p>

        
//       </div>

// import { useEffect } from "react";
// import { useAuthStore } from "../store/useAuthStore";

// const HomePage: React.FC = () => {
//   const { user, checkAuth } = useAuthStore();

//   useEffect(() => {
//     // Check auth in the background
//     const verifyAuth = async () => {
//       try {
//         await checkAuth();
//       } catch (error) {
//         console.error('Auth check failed:', error);
//       }
//     };

//     verifyAuth();
//   }, [checkAuth]);

//   // Always show the content immediately
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center">
//           <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
//             Welcome to DevHub
//           </h1>
          
//           {user ? (
//             <>
//               <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
//                 Hello, <span className="font-semibold text-emerald-600">{user.name}</span>! You're now logged in.
//               </p>
//               <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
//                 <div className="px-4 py-5 sm:p-6">
//                   <h3 className="text-lg leading-6 font-medium text-gray-900">Your Profile</h3>
//                   <div className="mt-2 max-w-xl text-sm text-gray-500">
//                     <p>Email: {user.email}</p>
//                     <p className="mt-1">Role: <span className="capitalize">{user.role.toLowerCase()}</span></p>
//                   </div>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <>
//               <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
//                 Join our developer community to collaborate on projects, share knowledge, and grow together.
//               </p>
//               <div className="mt-10 flex justify-center gap-4">
//                 <div className="rounded-md shadow">
//                   <a
//                     href="/signup"
//                     className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10"
//                   >
//                     Get Started
//                   </a>
//                 </div>
//                 <div className="rounded-md shadow">
//                   <a
//                     href="/login"
//                     className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
//                   >
//                     Sign in
//                   </a>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;

// import { useAuthStore } from "../store/useAuthStore";

// const HomePage: React.FC = () => {
//   const { user } = useAuthStore();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center">
//           <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
//             Welcome to DevHub
//           </h1>

//           {user ? (
//             <>
//               <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
//                 Hello, <span className="font-semibold text-emerald-600">{user.name}</span>! You're now logged in.
//               </p>
//               <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
//                 <div className="px-4 py-5 sm:p-6">
//                   <h3 className="text-lg leading-6 font-medium text-gray-900">Your Profile</h3>
//                   <div className="mt-2 max-w-xl text-sm text-gray-500">
//                     <p>Email: {user.email}</p>
//                     <p className="mt-1">Role: <span className="capitalize">{user.role.toLowerCase()}</span></p>
//                   </div>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <>
//               <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
//                 Join our developer community to collaborate on projects, share knowledge, and grow together.
//               </p>
//               <div className="mt-10 flex justify-center gap-4">
//                 <div className="rounded-md shadow">
//                   <a
//                     href="/signup"
//                     className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10"
//                   >
//                     Get Started
//                   </a>
//                 </div>
//                 <div className="rounded-md shadow">
//                   <a
//                     href="/login"
//                     className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
//                   >
//                     Sign in
//                   </a>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;

import { useAuthStore } from "../store/useAuthStore";

const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-indigo-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome to DevHub
          </h1>

          {user ? (
            <>
              <p className="mt-6 max-w-lg mx-auto text-xl text-indigo-600">
                Hello, <span className="font-semibold text-purple-600">{user.name}</span>! You're now logged in.
              </p>
              <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-indigo-900">Your Profile</h3>
                  <div className="mt-2 max-w-xl text-sm text-indigo-600">
                    <p>Email: {user.email}</p>
                    <p className="mt-1">Role: <span className="capitalize">{user.role.toLowerCase()}</span></p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="mt-6 max-w-lg mx-auto text-xl text-indigo-600">
                Join our developer community to collaborate on projects, share knowledge, and grow together.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <div className="rounded-md shadow">
                  <a
                    href="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                  >
                    Get Started
                  </a>
                </div>
                <div className="rounded-md shadow">
                  <a
                    href="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-indigo-200 text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                  >
                    Sign in
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;