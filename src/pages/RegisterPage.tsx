import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    setIsRegistering(true);
    try {
      await register(email, password);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-app-bg px-4 font-sans">
      <div className="w-full max-w-md p-10 space-y-8 bg-app-card rounded-3xl border border-app-border shadow-2xl transition-all duration-300">
        <div className="text-center">
            <h1 className="text-4xl font-black text-app-text-primary tracking-tight">Join PayBuddy</h1>
            <p className="mt-2 text-app-text-secondary font-medium">Start managing your collections today</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-brand-error bg-brand-error/10 rounded-xl border border-brand-error/20 font-medium">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-app-text-primary mb-2">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              className="w-full px-4 py-3.5 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-app-bg text-app-text-primary placeholder-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-app-text-primary mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-app-bg text-app-text-primary placeholder-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-brand-primary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-app-text-primary mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-app-bg text-app-text-primary placeholder-gray-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-brand-primary transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full px-4 py-4 font-black text-app-text-primary bg-brand-primary rounded-xl hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all focus:outline-none disabled:opacity-50 transform active:scale-[0.98]"
          >
            {isRegistering ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
            <p className="text-sm text-app-text-secondary font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-primary font-bold hover:underline">Sign In</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
