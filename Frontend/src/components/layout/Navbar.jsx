import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  CheckSquare, 
  LayoutDashboard, 
  Calendar, 
  BarChart2, 
  LogOut, 
  User 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 font-bold text-xl">
              <CheckSquare className="h-6 w-6" />
              <span>TaskSync</span>
            </Link>

            {user && (
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/calendar"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/calendar')
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </Link>

                <Link
                  to="/analytics"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/analytics')
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </div>
            )}
          </div>

          {/* User Info & Logout Button */}
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700">
                <User className="h-4 w-4 text-indigo-600" />
                <span>{user.name || user.email || 'User'}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}