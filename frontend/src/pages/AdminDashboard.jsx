import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, ShoppingBag, Users, AlertTriangle, ShieldCheck, RefreshCw, Eye, CheckCircle, XCircle
} from 'lucide-react';
import { fetchProducts, updateProductStock } from '../redux/slices/productsSlice';
import {
  fetchAdminOrders, fetchAdminAnalytics, fetchAdminVendors, updateAdminOrderStatus,
} from '../redux/slices/ordersSlice';
import toast from 'react-hot-toast';
import AdminLayout from '../layouts/AdminLayout';
import api from '../api/api';
import { API_URL } from '../api/api';

const STATUS_STYLES = {
  Pending:    'bg-amber-950/40 text-amber-400 border border-amber-800/40',
  Processing: 'bg-blue-950/40 text-blue-400 border border-blue-800/40',
  Shipped:    'bg-violet-950/40 text-violet-400 border border-violet-800/40',
  Delivered:  'bg-green-950/40 text-green-400 border border-green-800/40',
  Cancelled:  'bg-red-950/40 text-red-400 border border-red-800/40',
};

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { items: products } = useSelector((state) => state.products);
  const {
    adminOrders: orders,
    adminAnalytics: analytics,
    adminVendors: vendors,
    loading,
  } = useSelector((state) => state.orders);

  // Sync tab with URL search parameter
  const activeTab = new URLSearchParams(location.search).get('tab') || 'analytics';
  const [stockInputVal, setStockInputVal] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [kycQueue, setKycQueue] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);

  const loadData = () => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchProducts()),
      dispatch(fetchAdminOrders()),
      dispatch(fetchAdminAnalytics()),
      dispatch(fetchAdminVendors()),
    ]).finally(() => setRefreshing(false));
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/orders/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export downloaded securely.');
    } catch (err) {
      toast.error('Failed to export orders. Check permissions.');
    }
  };

  const fetchKycQueue = async () => {
    setKycLoading(true);
    try {
      const res = await api.get('/admin/kyc/queue');
      setKycQueue(res.data);
    } catch (err) {
      toast.error('Failed to load KYC verification queue');
    } finally {
      setKycLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    loadData();
  }, [dispatch, user, navigate]);

  useEffect(() => {
    if (activeTab === 'kyc') {
      fetchKycQueue();
    }
  }, [activeTab]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateAdminOrderStatus({ id: orderId, status: newStatus })).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
      dispatch(fetchAdminAnalytics());
      if (newStatus === 'Cancelled') {
        dispatch(fetchProducts());
      }
    } catch (err) {
      toast.error(err || 'Failed to update order status');
    }
  };

  const handleStockUpdateBlur = async (productId, currentVal) => {
    const newVal = parseInt(stockInputVal[productId]);
    if (isNaN(newVal) || newVal < 0) return;
    if (newVal === currentVal) return;
    try {
      await dispatch(updateProductStock({ id: productId, stock: newVal })).unwrap();
      toast.success('Inventory stock level updated');
      dispatch(fetchProducts());
      dispatch(fetchAdminAnalytics());
    } catch (err) {
      toast.error(err || 'Failed to update stock');
    }
  };

  const handleKycAction = async (userId, action) => {
    try {
      await api.patch(`/admin/kyc/${userId}`, { action });
      toast.success(`KYC status successfully ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchKycQueue();
      dispatch(fetchAdminVendors());
    } catch (err) {
      toast.error('Failed to update KYC status');
    }
  };

  const TABS = [
    { id: 'analytics', label: 'Overview' },
    { id: 'orders', label: 'Manage Orders' },
    { id: 'inventory', label: 'Global Inventory' },
    { id: 'vendors', label: 'Listed Vendors' },
    { id: 'kyc', label: 'KYC Queue' },
  ];

  // Build revenue chart data from analytics or use placeholders
  const revenueData = analytics?.revenueData?.map(d => ({ month: d.name, sales: d.revenue })) || 
    ['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => ({
      month: m,
      sales: analytics?.totalRevenue ? Math.round(analytics.totalRevenue * (0.1 + i * 0.05)) : 0
    }));

  return (
    <AdminLayout>
      <div className="py-8 px-4 md:px-8 text-white min-h-full">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="text-rose-500" size={30} />
                <span>Admin Dashboard</span>
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                Store Control Center
              </p>
            </div>
            <button
              disabled={refreshing}
              onClick={activeTab === 'kyc' ? fetchKycQueue : loadData}
              className="p-2.5 bg-[#0B0F1A] border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-2 text-sm font-semibold"
            >
              <RefreshCw size={16} className={refreshing || kycLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Reload State</span>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1.5 mb-8 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(t.id === 'analytics' ? '/admin' : `/admin?tab=${t.id}`)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                  activeTab === t.id
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in-up">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue */}
                <div className="bg-[#0B0F1A] border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Store Revenue
                    </p>
                    <h3 className="text-3xl font-bold text-white">
                      ${(analytics?.totalRevenue || 0).toFixed(2)}
                    </h3>
                  </div>
                  <div className="p-3 bg-emerald-950/40 rounded-xl text-emerald-400">
                    <TrendingUp size={22} />
                  </div>
                </div>

                {/* Orders */}
                <div className="bg-[#0B0F1A] border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      System Orders
                    </p>
                    <h3 className="text-3xl font-bold text-white">
                      {analytics?.totalOrders || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-violet-950/40 rounded-xl text-violet-400">
                    <ShoppingBag size={22} />
                  </div>
                </div>

                {/* Users */}
                <div className="bg-[#0B0F1A] border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Registered Users
                    </p>
                    <h3 className="text-3xl font-bold text-white">
                      {analytics?.totalUsers || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-950/40 rounded-xl text-blue-400">
                    <Users size={22} />
                  </div>
                </div>

                {/* Low Stock */}
                <div className="bg-[#0B0F1A] border border-amber-900/30 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-500/80 uppercase tracking-wider mb-1">
                      Low Stock Alerts
                    </p>
                    <h3 className="text-3xl font-bold text-amber-400">
                      {analytics?.lowStockCount || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-amber-950/40 rounded-xl text-amber-400">
                    <AlertTriangle size={22} />
                  </div>
                </div>
              </div>

              {/* Recharts Graphic Area */}
              <div className="bg-[#0B0F1A] border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Platform Revenue Waterfall</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                      <YAxis tick={{ fill: '#64748b' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-[#0B0F1A] border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Customer Conversion Funnel</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Product Views', value: analytics?.funnelData?.view_item || 0, color: 'bg-blue-500' },
                    { label: 'Added to Cart', value: analytics?.funnelData?.add_to_cart || 0, color: 'bg-indigo-500' },
                    { label: 'Began Checkout', value: analytics?.funnelData?.begin_checkout || 0, color: 'bg-violet-500' },
                    { label: 'Purchased', value: analytics?.funnelData?.purchase || 0, color: 'bg-emerald-500' }
                  ].map((step, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">{step.label}</p>
                      <h4 className="text-2xl font-black text-white mb-3">{step.value}</h4>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${step.color}`} style={{ width: `${Math.min(((step.value || 0) / (Math.max(analytics?.funnelData?.view_item || 1, 1))) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cohort Analysis */}
              <div className="bg-[#0B0F1A] border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Customer Retention Cohorts</h3>
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">New Customers</p>
                      <h4 className="text-3xl font-black text-white">{analytics?.cohortData?.newCustomers || 0}</h4>
                    </div>
                    <div className="p-3 bg-blue-950/40 rounded-xl text-blue-400">
                      <Users size={24} />
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-500/80 uppercase tracking-wider mb-1">Returning Customers</p>
                      <h4 className="text-3xl font-black text-emerald-400">{analytics?.cohortData?.returningCustomers || 0}</h4>
                    </div>
                    <div className="p-3 bg-emerald-950/40 rounded-xl text-emerald-400">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-[#0B0F1A] border border-slate-800 rounded-2xl overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-black text-white">System Orders Log</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 bg-violet-650 hover:bg-violet-755 text-white font-bold text-xs rounded-lg transition duration-200 cursor-pointer"
                  >
                    Export CSV
                  </button>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {orders.length} Total Orders
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6 text-xs">Order ID</th>
                      <th className="p-4 text-xs">Customer Name</th>
                      <th className="p-4 text-xs">Grand Total</th>
                      <th className="p-4 text-xs">Current Status</th>
                      <th className="p-4 pr-6 text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-slate-500">
                          Fetching orders...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-slate-500">
                          No orders in database.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-4 pl-6 font-mono text-xs text-slate-500">
                            #{String(order.id || '').slice(-8).toUpperCase()}
                          </td>
                          <td className="p-4 font-bold text-slate-200">
                            {order.shippingDetails?.fullName}
                          </td>
                          <td className="p-4 font-extrabold text-white">${order.total?.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[order.status]}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold p-1 px-2 text-white outline-none cursor-pointer focus:border-violet-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GLOBAL INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="bg-[#0B0F1A] border border-slate-800 rounded-2xl overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-black text-white">Listed Products Stock</h3>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {products.length} Active Items
                </span>
              </div>
              <div className="p-6 divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-center py-10 text-slate-500 text-sm">No products listed.</p>
                ) : (
                  products.map((p) => (
                    <div key={p.id} className="flex justify-between items-center py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-850" />
                        <div>
                          <p className="text-sm font-bold text-white leading-snug">{p.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Price: ${p.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={
                            stockInputVal[p.id] !== undefined ? stockInputVal[p.id] : p.stock
                          }
                          onChange={(e) =>
                            setStockInputVal({ ...stockInputVal, [p.id]: e.target.value })
                          }
                          onBlur={() => handleStockUpdateBlur(p.id, p.stock)}
                          className="w-16 text-center border border-slate-700 bg-slate-900 rounded-lg py-1 px-2 text-xs font-bold outline-none focus:border-violet-500 text-white"
                        />
                        {p.stock <= 5 && (
                          <span className="text-xs text-red-400 font-bold flex items-center gap-0.5">
                            <AlertTriangle size={14} />
                            <span>Low ({p.stock})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LISTED VENDORS */}
          {activeTab === 'vendors' && (
            <div className="bg-[#0B0F1A] border border-slate-800 rounded-2xl overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-black text-white">Registered Merchants</h3>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {vendors.length} Vendors Active
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6 text-xs">Merchant ID</th>
                      <th className="p-4 text-xs">Shop Name</th>
                      <th className="p-4 text-xs">Owner Name</th>
                      <th className="p-4 text-xs">Business Email</th>
                      <th className="p-4 pr-6 text-xs text-right">Items Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {vendors.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-slate-500">
                          No merchants registered.
                        </td>
                      </tr>
                    ) : (
                      vendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-4 pl-6 font-mono text-xs text-slate-500">{vendor.id}</td>
                          <td className="p-4 font-bold text-white">{vendor.shopName || 'N/A'}</td>
                          <td className="p-4 font-semibold text-slate-200">{vendor.name}</td>
                          <td className="p-4 text-slate-400">{vendor.email}</td>
                          <td className="p-4 pr-6 text-right font-black text-violet-400">
                            {vendor.productCount || 0} Products
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: KYC VERIFICATION QUEUE */}
          {activeTab === 'kyc' && (
            <div className="bg-[#0B0F1A] border border-slate-800 rounded-2xl overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-black text-white">KYC Documents Verification Queue</h3>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {kycQueue.length} Awaiting Review
                </span>
              </div>
              
              {kycLoading ? (
                <div className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 text-sm">Loading KYC queue...</p>
                </div>
              ) : kycQueue.length === 0 ? (
                <div className="text-center py-20">
                  <CheckCircle size={44} className="mx-auto text-emerald-500 mb-4" />
                  <p className="text-sm text-slate-400 font-bold">Verification queue clear. No pending submissions.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {kycQueue.map((vendor) => (
                    <div key={vendor.id} className="p-5 bg-[#0e1424] border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-base text-white">{vendor.shopName || 'Merchant Shop'}</h4>
                          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                            Pending Approval
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Owner: <span className="text-slate-200">{vendor.name}</span> | Email: <span className="text-slate-200">{vendor.email}</span>
                        </p>
                        
                        {/* Documents */}
                        <div className="mt-4 space-y-1.5">
                          <p className="text-xs font-bold text-slate-500 uppercase">Documents Attached:</p>
                          {vendor.kycDocuments?.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                              <span>• {doc.documentType}</span>
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 flex items-center gap-0.5">
                                <Eye size={12} /> View Document
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                        <button
                          onClick={() => handleKycAction(vendor.id, 'reject')}
                          className="bg-red-950/30 hover:bg-red-900/30 text-red-400 border border-red-800/40 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                        >
                          <XCircle size={14} /> Reject Vendor
                        </button>
                        <button
                          onClick={() => handleKycAction(vendor.id, 'approve')}
                          className="bg-emerald-950/30 hover:bg-emerald-900/30 text-emerald-400 border border-emerald-800/40 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                        >
                          <CheckCircle size={14} /> Approve KYC
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}
