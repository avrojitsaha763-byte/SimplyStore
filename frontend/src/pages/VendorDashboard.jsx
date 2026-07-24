import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, Package, AlertTriangle, Plus, Trash2, Edit2, Check, X, ShieldAlert,
  Ticket, Zap, Megaphone, Settings as SettingsIcon
} from 'lucide-react';
import { 
  fetchVendorProducts, addProduct, updateProduct, deleteProduct, updateProductStock 
} from '../redux/slices/productsSlice';
import { fetchVendorOrders, fetchVendorAnalytics } from '../redux/slices/ordersSlice';
import VendorLayout from '../layouts/VendorLayout';
import CouponBuilder from '../components/vendor/CouponBuilder';
import VendorKYC from './VendorKYC';
import VendorPricingRules from './VendorPricingRules';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function VendorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { vendorItems: products, loading: productsLoading } = useSelector((state) => state.products);
  const { vendorOrders: orders, vendorAnalytics: analytics } = useSelector((state) => state.orders);

  // Sync tab with URL search parameter
  const activeTab = new URLSearchParams(location.search).get('tab') || 'analytics';
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [stockInputVal, setStockInputVal] = useState({});

  // Flash Sale Form States
  const [flashProdId, setFlashProdId] = useState('');
  const [flashDiscount, setFlashDiscount] = useState('');
  const [flashDuration, setFlashDuration] = useState('');
  const [flashScheduling, setFlashScheduling] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      stock: '',
    },
  });

  // Guard routing
  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      navigate('/vendor-login');
      return;
    }
    dispatch(fetchVendorProducts());
    dispatch(fetchVendorOrders());
    dispatch(fetchVendorAnalytics());
  }, [dispatch, user, navigate]);

  // Handle edit product click
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('category', product.category);
    setValue('image', product.image);
    setValue('stock', product.stock);
    setShowDrawer(true);
  };

  const handleAddNewClick = () => {
    setEditingProduct(null);
    reset();
    setShowDrawer(true);
  };

  const handleProductSubmit = async (data) => {
    const productPayload = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      category: data.category,
      image: data.image,
      stock: parseInt(data.stock),
    };

    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, productData: productPayload })).unwrap();
        toast.success('Product updated successfully!');
      } else {
        await dispatch(addProduct(productPayload)).unwrap();
        toast.success('Product added successfully!');
      }
      setShowDrawer(false);
      reset();
      dispatch(fetchVendorProducts());
      dispatch(fetchVendorAnalytics());
    } catch (err) {
      toast.error(err || 'Failed to save product');
    }
  };

  const handleDeleteClick = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        toast.success('Product deleted successfully');
        dispatch(fetchVendorProducts());
        dispatch(fetchVendorAnalytics());
      } catch (err) {
        toast.error(err || 'Failed to delete product');
      }
    }
  };

  const handleStockUpdateBlur = async (productId, currentVal) => {
    const newVal = parseInt(stockInputVal[productId]);
    if (isNaN(newVal) || newVal < 0) return;
    if (newVal === currentVal) return;

    try {
      const res = await dispatch(updateProductStock({ id: productId, stock: newVal })).unwrap();
      toast.success('Stock updated');
      if (res.lowStockAlert) {
        toast(res.alertMessage || 'Low stock alert triggered!', { icon: '⚠️' });
      }
      dispatch(fetchVendorProducts());
      dispatch(fetchVendorAnalytics());
    } catch (err) {
      toast.error(err || 'Failed to update stock');
    }
  };

  // Schedule flash sale
  const handleFlashSaleSubmit = async (e) => {
    e.preventDefault();
    if (!flashProdId || !flashDiscount || !flashDuration) {
      toast.error('Please enter all flash sale details');
      return;
    }
    setFlashScheduling(true);
    try {
      await api.post('/vendor/marketing/flash-sale', {
        productId: flashProdId,
        discountPercent: parseFloat(flashDiscount),
        durationMinutes: parseInt(flashDuration)
      });
      toast.success('Flash sale scheduled and active!');
      setFlashProdId('');
      setFlashDiscount('');
      setFlashDuration('');
      dispatch(fetchVendorProducts());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger flash sale');
    } finally {
      setFlashScheduling(false);
    }
  };

  // Mock revenue monthly visualizer
  const mockRevenueData = [
    { month: 'Jan', sales: analytics?.totalRevenue ? analytics.totalRevenue * 0.4 : 1200 },
    { month: 'Feb', sales: analytics?.totalRevenue ? analytics.totalRevenue * 0.55 : 1900 },
    { month: 'Mar', sales: analytics?.totalRevenue ? analytics.totalRevenue * 0.7 : 2400 },
    { month: 'Apr', sales: analytics?.totalRevenue ? analytics.totalRevenue * 0.85 : 3100 },
    { month: 'May', sales: analytics?.totalRevenue ? analytics.totalRevenue * 1.0 : 4200 },
  ];

  return (
    <VendorLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight dark:text-white">Vendor Portal</h1>
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-1 uppercase tracking-wider">
              {user?.shopName || 'Apex Retail'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/vendor?tab=kyc')}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-2.5 px-6 rounded-xl hover:bg-gray-200 transition"
            >
              Verify KYC Documents
            </button>
            <button
              onClick={() => navigate('/vendor?tab=pricing-rules')}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-2.5 px-6 rounded-xl hover:bg-gray-200 transition"
            >
              Rules Manager
            </button>
            <button
              onClick={handleAddNewClick}
              className="bg-violet-600 hover:bg-violet-750 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-violet-100 dark:shadow-none transition duration-300"
            >
              <Plus size={18} />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Shop Revenue
                  </p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    ${(analytics?.totalRevenue || 0).toFixed(2)}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <TrendingUp size={22} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Total Sales
                  </p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {analytics?.totalOrders || 0} Orders
                  </h3>
                </div>
                <div className="p-3 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-xl">
                  <ShoppingBag size={22} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Listed Catalog
                  </p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {analytics?.totalProducts || 0} Products
                  </h3>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Package size={22} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
                    Low Stock Alerts
                  </p>
                  <h3 className="text-2xl font-black text-red-650 dark:text-red-400">
                    {analytics?.lowStockProducts?.length || 0} Items
                  </h3>
                </div>
                <div className="p-3 bg-red-100/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl">
                  <AlertTriangle size={22} />
                </div>
              </div>
            </div>

            {/* Recharts Graphical area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sales Performance Area */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Growth Visualizer</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockRevenueData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                      <XAxis dataKey="month" className="text-xs text-gray-400" />
                      <YAxis className="text-xs text-gray-400" />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" name="Revenue ($)" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Summary list */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Low Stock Warnings</h3>
                {analytics?.lowStockProducts && analytics.lowStockProducts.length > 0 ? (
                  <div className="space-y-4 max-h-72 overflow-y-auto">
                    {analytics.lowStockProducts.map((prod) => (
                      <div key={prod._id} className="flex items-center gap-3 p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950 rounded-xl">
                        <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-gray-800" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold truncate dark:text-white">{prod.name}</h4>
                          <p className="text-xs text-red-500 font-semibold mt-0.5">Only {prod.stock} units left</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <ShieldAlert size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">All item stocks healthy.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Inventory */}
        {activeTab === 'products' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in-up">
            {productsLoading ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm">Fetching store list...</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-400 font-bold text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                      <th className="p-4">Item Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Unit Price</th>
                      <th className="p-4">Live Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/35 transition text-sm">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={prod.image} alt={prod.name} className="w-12 h-12 object-cover rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-55 dark:bg-gray-950" />
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-950 dark:text-white truncate max-w-xs">{prod.name}</h4>
                              <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{prod.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-gray-600 dark:text-gray-300">{prod.category}</td>
                        <td className="p-4 font-extrabold text-gray-900 dark:text-white">${prod.price.toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              defaultValue={prod.stock}
                              onChange={(e) => setStockInputVal({ ...stockInputVal, [prod.id]: e.target.value })}
                              onBlur={() => handleStockUpdateBlur(prod.id, prod.stock)}
                              className="w-16 px-2 py-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-center font-bold outline-none focus:border-violet-500"
                            />
                            {prod.stock <= 5 && (
                              <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded">
                                Low
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(prod)}
                              className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-lg transition"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(prod.id)}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <ShieldAlert size={50} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Catalog empty</h3>
                <p className="text-sm text-gray-400 mb-6">List your first product to start accepting sales.</p>
                <button
                  onClick={handleAddNewClick}
                  className="bg-violet-600 hover:bg-violet-755 text-white font-bold py-2.5 px-6 rounded-xl transition"
                >
                  Create Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in-up">
            {orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-400 font-bold text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                      <th className="p-4">Order ID / Date</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Purchased Items</th>
                      <th className="p-4">Revenue Earned</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/35 transition text-sm">
                        <td className="p-4">
                          <span className="font-mono text-xs text-gray-500 font-bold block">
                            #{ord._id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <h4 className="font-bold text-gray-950 dark:text-white leading-snug">
                            {ord.shippingDetails?.fullName || 'Guest Customer'}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {ord.shippingDetails?.city}, {ord.shippingDetails?.state}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {ord.items?.map((item, idx) => (
                              <p key={idx} className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                {item.name} <span className="text-gray-400 font-bold">x{item.quantity}</span>
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-black text-gray-900 dark:text-white">
                          ${ord.items?.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                            ord.status === 'Delivered' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                            ord.status === 'Cancelled' ? 'bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400' :
                            'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <ShieldAlert size={50} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">No orders yet</h3>
                <p className="text-sm text-gray-400">Customer orders will appear here as they buy your products.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Marketing Campaigns (Coupons & Flash Sales) */}
        {activeTab === 'marketing' && (
          <div className="space-y-10 animate-fade-in-up">
            
            {/* Flash Sales Scheduler */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-950 dark:text-white mb-5 flex items-center gap-2">
                <Zap size={18} className="text-amber-500 fill-amber-500" /> Start Realtime Flash Sale
              </h2>
              <form onSubmit={handleFlashSaleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Select Item</label>
                  <select
                    value={flashProdId}
                    onChange={(e) => setFlashProdId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 cursor-pointer dark:text-white"
                  >
                    <option value="">Select product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Discount Percent (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={flashDiscount}
                    onChange={(e) => setFlashDiscount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 transition dark:text-white text-center font-bold text-violet-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Duration (Minutes)</label>
                  <input
                    type="number"
                    placeholder="e.g. 60"
                    value={flashDuration}
                    onChange={(e) => setFlashDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 transition dark:text-white text-center"
                  />
                </div>
                <button
                  type="submit"
                  disabled={flashScheduling}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition duration-300 flex items-center justify-center gap-2"
                >
                  <Zap size={16} /> {flashScheduling ? 'Activating...' : 'Activate Flash Sale'}
                </button>
              </form>
              <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
                ⚡ Flash sale applies the discount instantly. The server automatically reverts the item to its original price after duration ends.
              </p>
            </div>

            {/* Coupons Builder component */}
            <CouponBuilder />
          </div>
        )}

        {/* Tab 5: Settings / Shop Configuration (Stub) */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 animate-fade-in-up max-w-xl">
            <h2 className="text-lg font-bold text-gray-950 dark:text-white mb-5 flex items-center gap-2">
              <SettingsIcon size={18} className="text-gray-400" /> Store Settings
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Shop Display Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.shopName || 'Apex Retail'}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm outline-none text-gray-400 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Merchant Owner</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || 'Store Owner'}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none text-gray-400 font-bold"
                />
              </div>
              <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-950 p-4 rounded-xl text-xs font-semibold text-violet-750 dark:text-violet-400 leading-relaxed">
                🔒 Shop parameters and commission billing accounts are governed by platform admin policies. Request changes via support center.
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: KYC Document submissions */}
        {activeTab === 'kyc' && (
          <VendorKYC />
        )}

        {/* Tab 7: Pricing Rules Manager */}
        {activeTab === 'pricing-rules' && (
          <VendorPricingRules />
        )}

        {/* ── Add/Edit Product Slide Drawer ── */}
        {showDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end animate-fade-in-up">
            <div
              onClick={() => setShowDrawer(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full p-8 shadow-2xl border-l border-gray-100 dark:border-gray-800 overflow-y-auto flex flex-col justify-between z-10">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                    {editingProduct ? 'Edit Details' : 'Add Product'}
                  </h2>
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(productPayload => handleProductSubmit(productPayload))} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Item Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Leather Jacket"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-sm outline-none focus:border-violet-500 transition dark:text-white"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      rows="3"
                      placeholder="Product features, dimensions, technical parameters..."
                      {...register('description', { required: 'Description is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-sm outline-none focus:border-violet-500 transition dark:text-white"
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="999.99"
                        {...register('price', { required: 'Price is required' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-sm outline-none focus:border-violet-500 transition dark:text-white"
                      />
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Stock Quantity</label>
                      <input
                        type="number"
                        placeholder="15"
                        {...register('stock', { required: 'Stock quantity is required' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-sm outline-none focus:border-violet-500 transition dark:text-white"
                      />
                      {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Category</label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-sm outline-none focus:border-violet-500 cursor-pointer dark:text-white"
                    >
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                      <option value="Sports">Sports</option>
                      <option value="Books">Books</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Office">Office</option>
                      <option value="Garden">Garden</option>
                      <option value="Health">Health</option>
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Image URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      {...register('image', { required: 'Image URL is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-955 text-sm outline-none focus:border-violet-500 transition dark:text-white"
                    />
                    {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowDrawer(false)}
                      className="flex-1 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-250 font-bold py-3 rounded-xl hover:bg-gray-55 dark:hover:bg-gray-850 transition text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-violet-600 hover:bg-violet-750 text-white font-bold py-3 rounded-xl transition duration-300 shadow-lg shadow-violet-100 dark:shadow-none text-center"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
