import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Trash2, Plus, Zap, AlertCircle, Clock } from 'lucide-react';
import { fetchVendorProducts } from '../redux/slices/productsSlice';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function VendorPricingRules() {
  const dispatch = useDispatch();
  const { vendorItems: products } = useSelector((state) => state.products);

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form State
  const [productId, setProductId] = useState('');
  const [ruleType, setRuleType] = useState('stock-based');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [adjType, setAdjType] = useState('percentage');
  const [adjValue, setAdjValue] = useState('');

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/pricing/rules');
      setRules(res.data);
    } catch (err) {
      toast.error('Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchVendorProducts());
    fetchRules();
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !adjValue) {
      toast.error('Please select a product and adjustment value');
      return;
    }

    setCreating(true);

    const condition = {};
    if (ruleType === 'stock-based') {
      if (minStock !== '') condition.minStock = parseInt(minStock);
      if (maxStock !== '') condition.maxStock = parseInt(maxStock);
    } else if (ruleType === 'time-based') {
      if (dayOfWeek !== '') condition.dayOfWeek = parseInt(dayOfWeek);
      if (startTime) condition.startTime = startTime;
      if (endTime) condition.endTime = endTime;
    }

    const payload = {
      productId,
      ruleType,
      condition,
      adjustment: {
        type: adjType,
        value: parseFloat(adjValue)
      }
    };

    try {
      const res = await api.post('/vendor/pricing/rules', payload);
      toast.success('Pricing rule created and evaluated successfully!');
      setRules([...rules, res.data]);
      // Reset form
      setProductId('');
      setMinStock('');
      setMaxStock('');
      setDayOfWeek('');
      setStartTime('');
      setEndTime('');
      setAdjValue('');
      dispatch(fetchVendorProducts()); // Reload products to get latest prices
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create rule');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Delete this pricing rule?')) return;
    try {
      await api.delete(`/vendor/pricing/rules/${ruleId}`);
      toast.success('Pricing rule removed successfully');
      setRules(rules.filter(r => r.id !== ruleId));
      dispatch(fetchVendorProducts()); // Revert prices
    } catch (err) {
      toast.error('Failed to delete pricing rule');
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Panel Header */}
      <div className="flex items-center gap-3.5 mb-8 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="p-3 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-2xl">
          <Zap size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight dark:text-white">Dynamic Pricing Rules</h1>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Automate smart pricing rules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form (span-1) */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 h-fit">
          <h2 className="text-lg font-bold text-gray-950 dark:text-white mb-5 flex items-center gap-2">
            <Plus size={18} className="text-violet-600" /> Create Pricing Rule
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Select Product</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 cursor-pointer dark:text-white"
              >
                <option value="">Choose item...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Rule Trigger</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 cursor-pointer dark:text-white"
              >
                <option value="stock-based">Stock Scarcity / Overstock</option>
                <option value="time-based">Time / Day Schedule</option>
                <option value="demand-based">Low rating / demand booster</option>
              </select>
            </div>

            {/* Conditions based on rule type */}
            {ruleType === 'stock-based' && (
              <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800/40">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Min Stock</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:border-violet-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Max Stock</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:border-violet-500 text-center"
                  />
                </div>
              </div>
            )}

            {ruleType === 'time-based' && (
              <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800/40">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:border-violet-500 cursor-pointer dark:text-white"
                  >
                    <option value="">Everyday</option>
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Start Time</label>
                    <input
                      type="text"
                      placeholder="18:00"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:border-violet-500 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">End Time</label>
                    <input
                      type="text"
                      placeholder="22:00"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:border-violet-500 text-center font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3.5 border-t border-gray-100 dark:border-gray-800 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Adjust By</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 cursor-pointer dark:text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Value</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. -10 or 5"
                  value={adjValue}
                  onChange={(e) => setAdjValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 transition dark:text-white text-center font-bold text-violet-600"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              💡 Value must be negative for discounts (e.g. -15) and positive to increase price (e.g. 5).
            </p>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-violet-600 hover:bg-violet-750 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition duration-300 shadow-lg animate-pulse"
            >
              Create Dynamic Rule
            </button>
          </form>
        </div>

        {/* Right Column: Rules List (span-2) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-950 dark:text-white mb-5">Active Rules Log</h2>
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Loading dynamic rules list...</p>
            </div>
          ) : rules && rules.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {rules.map((rule) => {
                const product = products.find(p => p.id === rule.productId);
                return (
                  <div key={rule.id} className="p-4 bg-gray-55 dark:bg-gray-950 border border-gray-100 dark:border-gray-800/80 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="p-2.5 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-xl flex-shrink-0">
                        {rule.ruleType === 'time-based' ? <Clock size={20} /> : <Tag size={20} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-950 dark:text-white truncate">
                          {product ? product.name : 'Unknown Product'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                            {rule.ruleType}
                          </span>
                          <span className="text-xs text-gray-400 font-semibold">
                            Adjust: {rule.adjustment.value > 0 ? `+${rule.adjustment.value}` : rule.adjustment.value}
                            {rule.adjustment.type === 'percentage' ? '%' : '$'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
              <AlertCircle size={44} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">No rules registered</h3>
              <p className="text-sm text-gray-400">Automate your store prices with time or stock triggers.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
