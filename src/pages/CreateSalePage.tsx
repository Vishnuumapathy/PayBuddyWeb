import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCustomers } from '../hooks/useCustomers';
import { createSimpleSale } from '../repositories/salesRepository';
import { PageHeader, LoadingState, Card } from '../components';
import { formatCurrency } from '../utils/formatters';

const CreateSalePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vendorId } = useAuth();
  const { customers, loading: customersLoading } = useCustomers();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select customer from URL query param
  useEffect(() => {
    const customerIdFromQuery = searchParams.get('customerId');
    if (customerIdFromQuery && customers.length > 0) {
      const exists = customers.some(c => c.customerId === customerIdFromQuery);
      if (exists) {
        setSelectedCustomerId(customerIdFromQuery);
      }
    }
  }, [searchParams, customers]);

  const totalAmount = useMemo(() => quantity * unitPrice, [quantity, unitPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;

    // Validation
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }
    if (!itemName.trim()) {
      setError('Item name is required');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (unitPrice <= 0) {
      setError('Unit price must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const customer = customers.find(c => c.customerId === selectedCustomerId);
      if (!customer) throw new Error('Selected customer not found');

      await createSimpleSale(vendorId, {
        customerId: selectedCustomerId,
        customerName: customer.name,
        itemName,
        quantity,
        unitPrice,
        totalAmount,
      });

      navigate('/sales');
    } catch (err: any) {
      console.error('Error creating sale:', err);
      setError(err.message || 'Failed to create sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (customersLoading) return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <LoadingState />
    </div>
  );

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <PageHeader
          title="Create New Sale"
          subtitle="Full Payment Workflow"
          showBack
          backPath="/sales"
        />

        <div className="mt-8">
          <Card hoverable={false} className="p-8 bg-app-card border-app-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-brand-error/10 border-l-4 border-brand-error p-4 rounded-lg text-sm text-brand-error font-bold">
                  {error}
                </div>
              )}

              {/* Customer Selection */}
              <div>
                <label htmlFor="customer" className="block text-sm font-bold text-app-text-primary mb-2">
                  Customer *
                </label>
                <select
                  id="customer"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="block w-full rounded-xl border border-app-border bg-app-bg text-app-text-primary shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/50 text-sm py-3 transition-colors outline-none font-bold"
                  required
                >
                  <option value="" className="bg-app-card">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.customerId} value={c.customerId} className="bg-app-card">
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Name */}
              <div>
                <label htmlFor="itemName" className="block text-sm font-bold text-app-text-primary mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="block w-full rounded-xl border border-app-border bg-app-bg text-app-text-primary shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/50 text-sm py-3 px-4 transition-colors outline-none font-medium placeholder-gray-600"
                  placeholder="e.g. Samsung Galaxy S21"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-bold text-app-text-primary mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="block w-full rounded-xl border border-app-border bg-app-bg text-app-text-primary shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/50 text-sm py-3 px-4 transition-colors outline-none font-medium"
                    required
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label htmlFor="unitPrice" className="block text-sm font-bold text-app-text-primary mb-2">
                    Unit Price *
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-app-text-secondary font-medium sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      id="unitPrice"
                      min="0"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="block w-full pl-8 rounded-xl border border-app-border bg-app-bg text-app-text-primary shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/50 text-sm py-3 px-4 transition-colors outline-none font-medium placeholder-gray-600"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Total Amount (Read-only) */}
              <div className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/20 mt-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-brand-primary uppercase tracking-widest">Total Amount</span>
                  <span className="text-3xl font-black text-brand-primary tracking-tight">{formatCurrency(totalAmount)}</span>
                </div>
                <p className="mt-2 text-xs text-brand-primary/70 font-bold uppercase tracking-tighter">
                  * This sale will be marked as COMPLETED immediately upon creation.
                </p>
              </div>

              <div className="pt-6 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/sales')}
                  className="px-6 py-2.5 border border-app-border rounded-xl text-sm font-bold text-app-text-secondary hover:bg-app-bg hover:text-app-text-primary transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-2.5 border border-transparent rounded-xl shadow-lg shadow-brand-primary/20 text-sm font-black text-white bg-brand-primary hover:bg-brand-primary/90 transition-all active:scale-95 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Sale'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateSalePage;
