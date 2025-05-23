
import React, { useState, useCallback, useEffect } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { SparklesIcon } from './icons/SparklesIcon'; 
import { signInWithPassword, signUp } from '../services/authService';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  message?: string; // New prop for displaying a message
  onClose: () => void;
  onAuthSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'login', message, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode); // Reset mode when modal is reopened
      setEmail(''); // Clear fields
      setPassword('');
      setError(null); // Clear previous errors
    }
  }, [isOpen, initialMode]);

  const switchMode = () => {
    setMode(prevMode => (prevMode === 'login' ? 'register' : 'login'));
    setError(null); 
    setEmail('');
    setPassword('');
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim() || !password.trim()) {
        setError("Email and password are required.");
        setIsLoading(false);
        return;
    }
    
    try {
      let authResponse;
      if (mode === 'login') {
        authResponse = await signInWithPassword({ email, password });
      } else {
        authResponse = await signUp({ email, password });
      }

      if (authResponse.error) {
        setError(authResponse.error.message);
      } else if (authResponse.user) {
        if (mode === 'register' && authResponse.user.identities && authResponse.user.identities.length === 0) {
             setError("Registration successful! Please check your email to confirm your account.");
        } else if (mode === 'register' && authResponse.user.aud !== 'authenticated') {
            setError("Registration successful! Please check your email to confirm your account.");
        }
        else {
            // onAuthSuccess(); // Handled by onAuthStateChange in App.tsx
            // onClose(); // Handled by onAuthStateChange in App.tsx
        }
      } else if (mode === 'register') {
        setError("Registration successful! Please check your email to confirm your account.");
      }
      
    } catch (err) {
      console.error("Auth error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, mode, /* onClose, onAuthSuccess - these are handled by App.tsx now */]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ease-in-out"
      style={{ opacity: isOpen ? 1 : 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out"
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 bg-primary-600 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-6 w-6" />
            <h2 id="auth-modal-title" className="text-2xl font-bold">
              {mode === 'login' ? 'Login' : 'Create Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-neutral-200"
            aria-label="Close authentication modal"
            disabled={isLoading}
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
          {message && (
            <p className="text-sm p-3 mb-2 rounded-md bg-primary-700/70 text-primary-100 border border-primary-600 text-center" role="status">
              {message}
            </p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-200 mb-1">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-neutral-700 text-neutral-100 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-200 mb-1">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-neutral-700 text-neutral-100 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="••••••••"
              required
              minLength={6} 
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm p-3 rounded-md bg-red-700/50 text-red-100 border border-red-600" role="alert">
              {error}
            </p>
          )}
          
          {mode === 'register' && !message?.includes("confirm your account") && ( // Show confirmation note only if not already shown
             <p className="text-xs text-neutral-400">
                By creating an account, you agree to our terms. A confirmation email may be sent.
             </p>
          )}


          <div className="pt-4 flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full px-6 py-3 rounded-md font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                mode === 'login' ? 'Login' : 'Create Account'
              )}
            </button>
            <button
              type="button"
              onClick={switchMode}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-md text-neutral-300 bg-neutral-700 hover:bg-neutral-600 transition-colors disabled:opacity-50"
            >
              {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
