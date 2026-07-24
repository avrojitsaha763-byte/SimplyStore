import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { loginUser, signupUser, clearError } from '../redux/slices/authSlice';
import { fetchWishlist } from '../redux/slices/wishlistSlice';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BENEFITS = [
  'Free returns on every order',
  'Secure checkout & SSL encryption',
  'Over 10,000 happy shoppers',
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', password: '' },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
    return () => { dispatch(clearError()); };
  }, [user, navigate, dispatch]);

  const onSubmit = (data) => {
    if (isLogin) {
      dispatch(loginUser({ email: data.email, password: data.password }))
        .unwrap()
        .then((res) => {
          toast.success(`Welcome back, ${res.name}!`);
          dispatch(fetchWishlist());
          navigate('/');
        })
        .catch((err) => { toast.error(err || 'Failed to sign in'); });
    } else {
      dispatch(signupUser({ name: data.name, email: data.email, password: data.password }))
        .unwrap()
        .then((res) => {
          toast.success(`Account created successfully! Welcome, ${res.name}`);
          navigate('/');
        })
        .catch((err) => { toast.error(err || 'Failed to sign up'); });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    dispatch(clearError());
    reset();
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-violet-600 via-violet-700 to-purple-900 flex-col items-center justify-center px-10 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-40px] w-80 h-80 rounded-full bg-purple-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-xs">
          {/* Big Logo */}
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20">
            <span className="text-white font-black text-4xl leading-none">S</span>
          </div>

          <div>
            <h1 className="text-4xl font-black text-white leading-tight">
              Your Market.<br />Simplified.
            </h1>
            <p className="text-violet-200 text-sm mt-3 font-medium">
              Everything you need, curated just for you.
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-col gap-3 w-full text-left">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle className="text-violet-300 flex-shrink-0" size={18} />
                <span className="text-white/90 text-sm font-medium">{b}</span>
              </div>
            ))}
          </div>

          {/* Stat Bubbles */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['68 Products', '5 Vendors', '10K+ Users'].map((stat) => (
              <span
                key={stat}
                className="bg-white/10 text-white/90 rounded-full px-4 py-2 text-sm font-semibold border border-white/15 backdrop-blur-sm"
              >
                {stat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full md:w-3/5 bg-white dark:bg-gray-950 flex flex-col relative transition-colors duration-300">
        {/* Back to Store */}
        <div className="absolute top-5 right-5">
          <Link
            to="/"
            className="text-sm font-semibold text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            ← Back to Store
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-md shadow-violet-500/30">
                <span className="text-white font-black text-base leading-none">S</span>
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                SimplyStore
              </span>
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">
              {isLogin ? 'Welcome back 👋' : 'Create an account'}
            </h2>
            <p className="text-sm text-gray-400 mb-7">
              {isLogin ? 'Sign in to continue shopping' : 'Join thousands of happy shoppers'}
            </p>

            {/* Tab Switcher */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex mb-7">
              <button
                onClick={() => !isLogin && toggleMode()}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isLogin
                    ? 'bg-white dark:bg-gray-700 text-violet-600 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => isLogin && toggleMode()}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  !isLogin
                    ? 'bg-white dark:bg-gray-700 text-violet-600 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm font-semibold mb-5">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name (signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition dark:text-white"
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                    })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition dark:text-white"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition dark:text-white"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 dark:shadow-none mt-2 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Trust strip */}
            <p className="text-xs text-center text-gray-400 mt-6">
              🔒 SSL Secured · Free Returns · 10K+ Shoppers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
