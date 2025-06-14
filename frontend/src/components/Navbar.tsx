import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, LogIn, LogOut } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const success = await logout();
      
      if (success) {
        // Navigate to home page after successful logout
        navigate('/', { replace: true });
        // Force a full page reload to ensure all state is cleared
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          DevHub
        </Link>

        <nav className="flex space-x-6 items-center">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>

          {user ? (
            <button
              className={`flex items-center space-x-1 bg-red-500 px-3 py-2 rounded-lg hover:bg-red-600 ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={18} className={isLoggingOut ? 'animate-spin' : ''} />
              <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
            </button>
          ) : (
            <>
              <Link
                to="/signup"
                className="flex items-center space-x-1 bg-green-500 px-3 py-2 rounded-lg hover:bg-green-600"
              >
                <UserPlus size={18} />
                Sign Up
              </Link>
              <Link
                to="/login"
                className="flex items-center space-x-1 bg-blue-500 px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                <LogIn size={18} />
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

