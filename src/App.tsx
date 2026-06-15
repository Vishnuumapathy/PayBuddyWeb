import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './auth/AuthProvider';
import { useContext } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import SalesPage from './pages/SalesPage';
import CreateSalePage from './pages/CreateSalePage';
import PaymentsPage from './pages/PaymentsPage';
import RecordPaymentPage from './pages/RecordPaymentPage';
import InstallmentsPage from './pages/InstallmentsPage';
import LedgerPage from './pages/LedgerPage';

const AppRoutes = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) return null;

  const { user, loading } = authContext;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app-bg">
        <div className="flex flex-col items-center">
          <div className="text-5xl font-black text-brand-primary tracking-tighter animate-pulse drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            PayBuddy
          </div>
          <div className="mt-4 flex gap-1">
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/onboarding"
        element={user ? <OnboardingPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard"
        element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/customers"
        element={user ? <CustomersPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/customers/:customerId"
        element={user ? <CustomerProfilePage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/sales"
        element={user ? <SalesPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/sales/create"
        element={user ? <CreateSalePage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/payments"
        element={user ? <PaymentsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/payments/record"
        element={user ? <RecordPaymentPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/installments"
        element={user ? <InstallmentsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/ledger"
        element={user ? <LedgerPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
