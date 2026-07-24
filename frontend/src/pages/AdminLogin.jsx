import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck, ArrowLeft, Lock, Mail } from 'lucide-react';
import { loginAdmin, clearError } from '../redux/slices/authSlice';

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
    return () => {
      dispatch(clearError());
    };
  }, [user, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(loginAdmin({ email: data.email, password: data.password }))
      .unwrap()
      .then(() => {
        toast.success('Admin access granted.');
        navigate('/admin');
      })
      .catch((err) => {
        toast.error(err || 'Authentication failed');
      });
  };

  return (
    <div className="min-h-screen bg-[#060912] flex items-center justify-center p-6">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to store */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Store
        </Link>

        {/* Card */}
        <div className="bg-[#0B0F1A] border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-rose-600/15 border border-rose-600/20 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={26} className="text-rose-500" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Restricted access — authorized personnel only
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="off"
                  placeholder="admin@simplystore.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`w-full bg-[#111827] border ${
                    errors.email ? 'border-red-600' : 'border-slate-700'
                  } text-white placeholder-slate-600 rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600/30 transition`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 4,
                      message: 'Password must be at least 4 characters',
                    },
                  })}
                  className={`w-full bg-[#111827] border ${
                    errors.password ? 'border-red-600' : 'border-slate-700'
                  } text-white placeholder-slate-600 rounded-xl px-4 py-3 pl-10 pr-10 text-sm outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600/30 transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="admin-login-submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Access Admin Dashboard
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-600 mt-6">
            This portal is monitored and access is logged.
          </p>
        </div>
      </div>
    </div>
  );
}
