import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Store,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';

const NAV = [
  { icon: LayoutDashboard, label: 'Overview', tab: '' },
  { icon: ShoppingBag, label: 'Orders', tab: 'orders' },
  { icon: Package, label: 'Inventory', tab: 'inventory' },
  { icon: Store, label: 'Vendors', tab: 'vendors' },
  { icon: ShieldCheck, label: 'KYC Queue', tab: 'kyc' },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const tab = new URLSearchParams(location.search).get('tab') || '';

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#060912] text-white">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } flex-shrink-0 bg-[#0B0F1A] border-r border-slate-800 flex flex-col transition-all duration-300 hidden md:flex`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-rose-500" />
          </div>
          {!collapsed && (
            <span className="font-bold text-white text-sm">
              SimplyStore{' '}
              <span className="text-rose-400 text-xs">Admin</span>
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const isActive = tab === item.tab;
            return (
              <Link
                key={item.tab}
                to={`/admin${item.tab ? '?tab=' + item.tab : ''}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-slate-800">
          {!collapsed && user && (
            <p className="text-xs text-slate-500 truncate mb-2 px-2">
              {user.email}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition w-full"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">Sign Out</span>
            )}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-slate-600 hover:text-slate-400 transition w-full"
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B0F1A] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-rose-500" />
          <span className="font-bold text-white text-sm">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? (
            <X size={20} className="text-white" />
          ) : (
            <Menu size={20} className="text-white" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-[#0B0F1A] border-r border-slate-800 flex flex-col z-50 pt-14">
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {NAV.map((item) => {
                const isActive = tab === item.tab;
                return (
                  <Link
                    key={item.tab}
                    to={`/admin${item.tab ? '?tab=' + item.tab : ''}`}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                      isActive
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-slate-800">
              {user && (
                <p className="text-xs text-slate-500 truncate mb-2 px-2">
                  {user.email}
                </p>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition w-full"
              >
                <LogOut size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">{children}</main>
    </div>
  );
}
