// import "./index.css"

// import { Navigate, Route, Routes} from 'react-router-dom';

// import HomePage from './pages/Home';
// import SignUpPage from './pages/Signup';
// import LoginPage from './pages/Login';


// import Navbar from './components/Navbar.jsx';
// import {Toaster} from "react-hot-toast";
// import { useUserStore } from "./store/useUserStore";
// import { useEffect } from "react";
// // import { get } from 'express/lib/response.js';


// function App() {
//   const { user,checkAuth ,checkingAuth} = useUserStore();

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);  // to solve the issue of automatic switch to login page after login and switch to home page and when refres the page we are redirected to login page

//   if(checkingAuth) return <h1>Loading...</h1>;

//   return (
//     <div>
//       <Navbar/>
//       <Routes>
//         <Route path = '/' element={<HomePage/>}/>
//         <Route path = '/signup' element = { !user ? <SignUpPage/> : <Navigate to ='/'/>}/>
//         <Route path = '/login' element = { !user ? <LoginPage/> : <Navigate to='/'/>}/>
//       <Toaster/>
//     </div>
//   );
// }

// export default App

import "./index.css";

import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import SignUpPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./store/useUserStore";
import { useEffect } from "react";

const App: React.FC = () => {
  const { user, checkAuth, checkingAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) return <h1>Loading...</h1>;

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={!user ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
