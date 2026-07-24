import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, Ticket, AlertCircle } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function CouponBuilder() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [type, setType] = useState('percent');
  const [minOrder, setMinOrder] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/marketing/coupons');
      setCoupons(res.data);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discount) {
      toast.error('Please enter coupon code and discount value');
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/vendor/marketing/coupons', {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        type,
        minOrder: minOrder ? parseFloat(minOrder) : 0
      });
      toast.success('Coupon created successfully!');
      setCoupons([...coupons, res.data]);
      setCode('');
      setDiscount('');
      setMinOrder('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/vendor/marketing/coupons/${couponId}`);
      toast.success('Coupon deleted');
      setCoupons(coupons.filter(c => c.id !== couponId));
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left: Form */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 h-fit">
        <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-5 flex items-center gap-2">
          <Plus size={18} className="text-violet-600" /> Create Coupon
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Coupon Code</label>
            <input
              type="text"
              placeholder="e.g. MEGA25"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 transition dark:text-white font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 cursor-pointer dark:text-white"
              >
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Value</label>
              <input
                type="number"
                placeholder="25"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-sm outline-none focus:border-violet-500 transition dark:text-white text-center font-bold text-violet-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Min Order ($)</label>
            <input
              type="number"
              placeholder="50"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-sm outline-none focus:border-violet-500 transition dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-violet-600 hover:bg-violet-750 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition duration-300 shadow-lg mt-4"
          >
            Create Coupon
          </button>
        </form>
      </div>

      {/* Right: List */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-5">Active Promo Coupons</h3>
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading coupons list...</p>
          </div>
        ) : coupons && coupons.length > 0 ? (
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {coupons.map((cp) => (
              <div key={cp.id} className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800/80 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex-shrink-0">
                    <Ticket size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-950 dark:text-white font-mono uppercase tracking-wide">
                      {cp.code}
                    </h4>
                    <p className="text-xs text-gray-450 dark:text-gray-400 mt-0.5">
                      Discount: <span className="font-bold text-emerald-600">{cp.discount}{cp.type === 'percent' ? '%' : '$'}</span>
                      {cp.minOrder > 0 && ` | Min Order: $${cp.minOrder}`}
                      {cp.vendorId === null && <span className="text-amber-500 font-bold ml-1.5">(Platform)</span>}
                    </p>
                  </div>
                </div>
                {cp.vendorId !== null && (
                  <button
                    onClick={() => handleDelete(cp.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
            <AlertCircle size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No coupons listed.</p>
          </div>
        )}
      </div>

    </div>
  );
}
