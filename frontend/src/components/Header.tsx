import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCog } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-white shadow">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-6 lg:px-8">
        {/* className="max-w-screen-2xl mx-auto py-6 sm:px-6 lg:px-8"> */}
        <div className="flex justify-between h-16 items-center">
          <nav className="flex space-x-8">
            <Link
              to="/dashboard"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                location.pathname === '/dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Главная страница
            </Link>
            
            {user?.role === 'teacher' && (
              <Link
                to="/search"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location.pathname === '/search'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Поиск ассистентов
              </Link>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/settings"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 ${
                location.pathname === '/settings'
                  // ? 'text-white bg-blue-600 hover:bg-blue-700'
                  // : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <UserCog className="h-6 w-6 mr-2" />
            </Link>

            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;