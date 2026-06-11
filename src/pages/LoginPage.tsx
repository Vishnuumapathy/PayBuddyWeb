import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
        <div className="text-center">
            <h1 className="text-4xl font-black text-indigo-600 tracking-tight">PayBuddy</h1>
            <p className="mt-2 text-gray-500 font-medium">Premium SaaS Payment Management</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-rose-700 bg-rose-50 rounded-lg border border-rose-100 font-medium">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full px-4 py-3.5 font-black text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all focus:outline-none disabled:bg-indigo-300 disabled:shadow-none transform active:scale-[0.98]"
          >
            {isLoggingIn ? 'Verifying Account...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="pt-4 text-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Secure Vendor Access</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
