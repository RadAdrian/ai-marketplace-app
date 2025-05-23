
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
      if (mode === 'login') {
        const authResponse = await signInWithPassword({ email, password });
        if (authResponse.error) {
          setError(authResponse.error.message);
        }
        // On successful login, onAuthStateChange in App.tsx will handle closing the modal
      } else { // mode === 'register'
        const authResponse = await signUp({ email, password });
        if (authResponse.error) {
          const errorMessageLower = authResponse.error.message.toLowerCase();
          if (errorMessageLower.includes("user already registered") || 
              errorMessageLower.includes("already been registered") ||
              (authResponse.error.status === 400 && errorMessageLower.includes("user with this email already exists")) || // Common pattern for some backends
              (authResponse.error.status === 422 && errorMessageLower.includes("already registered")) // Another common status
            ) {
            setError("This email is already registered. Please try logging in.");
            setMode('login'); 
          } else {
            setError(authResponse.error.message);
          }
        } else if (authResponse.user) {
          // User object exists, no explicit error from signUp.
          // Now check if this user is already confirmed based on the info in *this signUp response*.
          // This relies on `email_confirmed_at` being set in the signUp response if the user was *already* confirmed.
          // If Supabase always nullifies this in signUp responses to indicate "confirmation process active",
          // then this check won't distinguish an already-confirmed user from a new one without an explicit error above.
          if (authResponse.user.email_confirmed_at && authResponse.user.aud === 'authenticated') {
            setError("This email is already registered and confirmed. Please log in.");
            setMode('login');
          } else {
            // This path is taken if:
            // 1. The user is genuinely new (email_confirmed_at will be null/undefined).
            // 2. The user exists but is unconfirmed (email_confirmed_at will be null/undefined).
            // 3. The user exists and *is* confirmed in the DB, BUT the signUp response object
            //    does not include email_confirmed_at (or sets it to null) for this re-signup attempt.
            // In case 3, the client gets the same info as for cases 1 & 2.
            setError("Registration successful! Please check your email to confirm your account.");
          }
        } else {
          // Fallback, should ideally not be reached if signUp always returns user or error
          setError("Registration request processed. If this is a new account, please check your email to confirm.");
        }
      }
      
    } catch (err) {
      console.error("Auth error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, mode]);

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
            <p className={`text-sm p-3 rounded-md border ${error.includes("confirm your account") || error.includes("Registration request processed") ? "bg-sky-700/50 text-sky-100 border-sky-600" : "bg-red-700/50 text-red-100 border-red-600"}`} role="alert">
              {error}
            </p>
          )}
          
          {mode === 'register' && !error?.includes("confirm your account") && !error?.includes("already registered") && !error?.includes("Registration request processed") && ( 
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
