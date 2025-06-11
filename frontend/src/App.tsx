import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { LoginForm } from './features/auth/components/LoginForm';
import { RegisterForm } from './features/auth/components/RegisterForm';
import { Profile } from './features/auth/components/Profile';
import { useAuth } from './features/auth/AuthContext';
import { CommunityList } from './features/community/components/CommunityList';
import { CreateCommunity } from './features/community/components/CreateCommunity';
import { CommunityDetail } from './features/community/components/CommunityDetail';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
   }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      {/* Community Routes */}
      <Route
        path="/communities"
        element={
          <ProtectedRoute>
            <CommunityList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/communities/create"
        element={
          <ProtectedRoute>
            <CreateCommunity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/communities/:communityId"
        element={
          <ProtectedRoute>
            <CommunityDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-lg font-semibold text-gray-700 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <AppRoutes />
      </main>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent/>
      </Router>
    </AuthProvider>
  );
};

export default App;

