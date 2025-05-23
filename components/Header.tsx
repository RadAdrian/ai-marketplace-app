
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { User } from '../types'; // Import Supabase User type

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  isAuthLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onRegister, onLogout, isAuthLoading }) => {
  return (
    <header className="bg-neutral-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-8 w-8 text-primary-500" />
          <span className="text-2xl font-bold text-neutral-100">AI Platform</span>
        </div>
        <nav className="flex items-center space-x-3">
          {isAuthLoading ? (
            <div className="text-sm text-neutral-400">Loading user...</div>
          ) : user ? (
            <>
              <span className="text-sm text-neutral-300 hidden sm:block">{user.email}</span>
              <button
                onClick={onLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="px-3 py-2 rounded-md text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={onRegister}
                className="px-3 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
