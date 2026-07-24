import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Store,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import { loginVendor, registerVendor, clearError } from '../redux/slices/authSlice';

export default function VendorLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user && user.role === 'vendor') {
      navigate('/vendor');
    }
    return () => {
      dispatch(clearError());
    };
  }, [user, navigate, dispatch]);

  const onSubmit = (data) => {
    if (isLogin) {
      dispatch(loginVendor({ email: data.email, password: data.password }))
        .unwrap()
        .then(() => {
          toast.success('Welcome back to your vendor portal!');
          navigate('/vendor');
        })
        .catch((err) => {
          toast.error(err || 'Login failed. Please check your credentials.');
        });
    } else {
      dispatch(
        registerVendor({
          name: data.name,
          email: data.email,
          password: data.password,
          shopName: data.shopName,
        })
      )
        .unwrap()
        .then(() => {
          toast.success('Vendor account created successfully!');
          navigate('/vendor');
        })
        .catch((err) => {
          toast.error(err || 'Registration failed. Please try again.');
        });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-violet-700 via-purple-800 to-slate-900 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6 border border-white/20">
            <Store size={32} className="text-violet-200" />
          </div>
          <h2 className="text-4xl font-black mb-4 text-center leading-tight">
            Grow Your Business
          </h2>
          <p className="text-violet-200 text-center mb-10 text-sm leading-relaxed">
            Join thousands of vendors on SimplyStore and reach customers worldwide
          </p>

          {/* Feature list */}
          <div className="space-y-3 w-full">
            {[
              ['📊', 'Real-time analytics & insights'],
              ['📦', 'Smart inventory management'],
              ['💰', 'Competitive commission rates'],
            ].map(([icon, text]) => (
              <div
                key={text}
                className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/10"
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-medium text-white/90">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-10 pt-8 border-t border-white/10 w-full justify-center">
            {[
              ['10K+', 'Vendors'],
              ['50K+', 'Products'],
              ['99.9%', 'Uptime'],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-violet-300 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950 min-h-screen">
        <div className="w-full max-w-sm">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm mb-8 transition group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Store
          </Link>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Vendor Portal
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {isLogin
                ? 'Sign in to manage your store'
                : 'Create your vendor account today'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
            <button
              id="vendor-login-tab"
              onClick={() => {
                setIsLogin(true);
                reset();
                dispatch(clearError());
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                isLogin
                  ? 'bg-white dark:bg-gray-700 text-violet-600 shadow'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              id="vendor-register-tab"
              onClick={() => {
                setIsLogin(false);
                reset();
                dispatch(clearError());
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                !isLogin
                  ? 'bg-white dark:bg-gray-700 text-violet-600 shadow'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    id="vendor-name"
                    type="text"
                    placeholder="Your full name"
                    {...register('name', { required: 'Full name is required' })}
                    className={`w-full border ${
                      errors.name
                        ? 'border-red-400 dark:border-red-600'
                        : 'border-gray-200 dark:border-gray-700'
                    } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
            )}

            {/* Shop Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Shop Name
                </label>
                <div className="relative">
                  <Building2
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    id="vendor-shop-name"
                    type="text"
                    placeholder="Your store name"
                    {...register('shopName', { required: 'Shop name is required' })}
                    className={`w-full border ${
                      errors.shopName
                        ? 'border-red-400 dark:border-red-600'
                        : 'border-gray-200 dark:border-gray-700'
                    } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition`}
                  />
                </div>
                {errors.shopName && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.shopName.message}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="vendor-email"
                  type="email"
                  autoComplete="email"
                  placeholder="vendor@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`w-full border ${
                    errors.email
                      ? 'border-red-400 dark:border-red-600'
                      : 'border-gray-200 dark:border-gray-700'
                  } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="vendor-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`w-full border ${
                    errors.password
                      ? 'border-red-400 dark:border-red-600'
                      : 'border-gray-200 dark:border-gray-700'
                  } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 rounded-xl px-4 py-3 pl-10 pr-10 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="vendor-submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                <>
                  <Store size={16} />
                  {isLogin ? 'Sign In to Portal' : 'Create Vendor Account'}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            {isLogin ? (
              <>
                Don't have a vendor account?{' '}
                <button
                  onClick={() => {
                    setIsLogin(false);
                    reset();
                    dispatch(clearError());
                  }}
                  className="text-violet-600 font-semibold hover:underline"
                >
                  Register now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsLogin(true);
                    reset();
                    dispatch(clearError());
                  }}
                  className="text-violet-600 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
