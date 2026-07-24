import React, { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ReferralDashboard from './pages/ReferralDashboard';
import WholesalePortal from './pages/WholesalePortal';
import { fetchWishlist } from './redux/slices/wishlistSlice';

// Initialize app state on load
function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && user.token && user.role === 'customer') {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  return children;
}

// Protected Route: Vendors only
function VendorRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  if (!user || user.role !== 'vendor') {
    return <Navigate to="/vendor-login" replace />;
  }
  return children;
}

// Protected Route: Admins only
function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
}

// Customer-facing layout — has Navbar
function MainLayout() {
  const { user } = useSelector((state) => state.auth);
  const isDark = useSelector((state) => state.theme?.darkMode);

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col selection:bg-violet-200 dark:selection:bg-violet-900`}>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/referrals" element={<ReferralDashboard />} />
          <Route path="/wholesale" element={<WholesalePortal />} />
          <Route path="/login" element={<Login />} />
          {/* Vendor & Admin login accessible from customer layout but redirect if already logged in */}
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:!bg-gray-800 dark:!text-white dark:!border dark:!border-gray-700 font-sans font-semibold text-sm',
          duration: 3500,
          style: { borderRadius: '12px' },
        }}
      />
    </div>
  );
}

// Admin layout — isolated, no Navbar
function AdminLayout() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

// Vendor layout — isolated, no customer Navbar
function VendorLayout() {
  return (
    <Routes>
      <Route
        path="/vendor"
        element={
          <VendorRoute>
            <VendorDashboard />
          </VendorRoute>
        }
      />
    </Routes>
  );
}

// Root router — decides which layout to apply
function RootRouter() {
  return (
    <Routes>
      {/* Admin routes — isolated dark layout, no customer Navbar */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      {/* Vendor routes — isolated layout */}
      <Route path="/vendor" element={<VendorRoute><VendorDashboard /></VendorRoute>} />
      {/* Customer storefront — MainLayout with Navbar */}
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <AppInitializer>
            <RootRouter />
          </AppInitializer>
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}