import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { saveVendorProfile } from '../repositories/vendorRepository';
import type { Vendor } from '../models/paybuddy';

const OnboardingPage: React.FC = () => {
  const { user, refreshVendor } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    phone: '',
    upiId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const vendorData: Vendor = {
        vendorId: user.uid,
        email: user.email || '',
        name: formData.name,
        shopName: formData.shopName,
        phone: formData.phone,
        upiId: formData.upiId,
        createdAt: Date.now(),
      };

      await saveVendorProfile(vendorData);
      await refreshVendor();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-app-bg px-4 font-sans">
      <div className="w-full max-w-xl p-10 space-y-8 bg-app-card rounded-3xl border border-app-border shadow-2xl transition-all duration-300">
        <div className="text-center">
          <h1 className="text-4xl font-black text-app-text-primary tracking-tight">Vendor Onboarding</h1>
          <p className="mt-2 text-app-text-secondary font-medium">Tell us about your business to get started</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-brand-error bg-brand-error/5 rounded-xl border border-brand-error/10 font-medium">
            {error}
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-app-text-primary mb-2">Full Name</label>
            <input
              type="text"
              required
              placeholder="Enter your name"
              className="w-full px-4 py-3.5 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-app-bg text-app-text-primary placeholder-gray-600"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-app-text-primary mb-2">Shop/Business Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Stores"
              className="w-full px-4 py-3.5 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-app-bg text-app-text-primary placeholder-gray-600"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-app-text-primary mb-2">Phone Number</label>
            <input
              type="tel"
              required
              placeholder="+91 00000 00000"
              className="w-full px-4 py-3.5 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-app-bg text-app-text-primary placeholder-gray-600"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-app-text-primary mb-2">UPI ID (for payments)</label>
            <input
              type="text"
              required
              placeholder="username@okaxis"
              className="w-full px-4 py-3.5 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all bg-app-bg text-app-text-primary placeholder-gray-600"
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-4 font-black text-app-text-primary bg-brand-primary rounded-xl hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all focus:outline-none disabled:opacity-50 transform active:scale-[0.98]"
            >
              {loading ? 'Setting up your account...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
