import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, Heart, User, Package, Settings, LogOut, Sun, Moon, Shield, Menu, X, Bell, Gift } from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { clearWishlist } from '../redux/slices/wishlistSlice';
import { toggleDarkMode } from '../redux/slices/themeSlice';
import NotificationCenter from './NotificationCenter';
import LoyaltyBadge from './LoyaltyBadge';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { darkMode } = useSelector((state) => state.theme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoutClick = () => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearWishlist());
    navigate('/');
  };

  return (
    <header
      className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg shadow-violet-500/5 dark:shadow-black/30' : 'shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            {/* SVG Logo Mark */}
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/30">
              <span className="text-white font-black text-base leading-none">S</span>
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent tracking-tight">
              SimplyStore
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="text-sm font-semibold px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200"
            >
              Shop
            </Link>
            <Link
              to="/deals"
              className="text-sm font-semibold px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200"
            >
              Deals
            </Link>
            <Link
              to="/wholesale"
              className="text-sm font-semibold px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200"
            >
              Wholesale
            </Link>
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Bell Icon */}
          <NotificationCenter />

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce"
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth Menu – Desktop */}
          <div className="relative group hidden md:block ml-1">
            {user ? (
              <div className="flex items-center gap-2 cursor-pointer py-2 px-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm uppercase shadow-md shadow-violet-500/30">
                  {user.name?.charAt(0) || '?'}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user.name}</span>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 ease-out transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Signed in as</p>
                    <p className="text-sm font-bold truncate dark:text-white mt-0.5">{user.email}</p>
                    <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold capitalize">
                      {user.role}
                    </span>
                    {user.role === 'customer' && (
                      <div className="mt-2.5">
                        <LoyaltyBadge />
                      </div>
                    )}
                  </div>
                  <div className="p-1.5">
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-2 rounded-xl transition-colors"
                      >
                        <Settings size={15} /> Admin Dashboard
                      </Link>
                    )}
                    {user.role === 'vendor' && (
                      <Link
                        to="/vendor"
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-2 rounded-xl transition-colors"
                      >
                        <Settings size={15} /> Vendor Dashboard
                      </Link>
                    )}
                    {user.role === 'customer' && (
                      <>
                        <Link
                          to="/orders"
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-2 rounded-xl transition-colors"
                        >
                          <Package size={15} /> My Orders
                        </Link>
                        <Link
                          to="/referrals"
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-2 rounded-xl transition-colors"
                        >
                          <Gift size={15} /> Refer & Earn
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/25 flex items-center gap-2 rounded-xl transition-colors"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/30"
              >
                <User size={18} />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ml-1"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer – framer-motion slide from right */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 bg-black/40 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-16 right-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 md:hidden shadow-2xl border-l border-gray-100 dark:border-gray-800 flex flex-col p-5 gap-2 overflow-y-auto"
            >
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/deals"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
              >
                Deals
              </Link>
              <Link
                to="/wholesale"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
              >
                Wholesale
              </Link>

              <hr className="border-gray-100 dark:border-gray-800 my-2" />

              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 py-2 px-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-violet-500/30">
                      {user.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'vendor' && (
                    <Link
                      to="/vendor"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                    >
                      Vendor Dashboard
                    </Link>
                  )}
                  {user.role === 'customer' && (
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                    >
                      My Orders
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogoutClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
