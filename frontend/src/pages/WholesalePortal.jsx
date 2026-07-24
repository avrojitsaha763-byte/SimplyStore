import React, { useEffect, useState } from 'react';
import { Store, MessageSquare, Send, ArrowRight, ShieldAlert, Award, FileText, ChevronRight, Check } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function WholesalePortal() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(50);
  const [price, setPrice] = useState(0);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Selected negotiation thread state
  const [activeRequest, setActiveRequest] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [counterPriceInput, setCounterPriceInput] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, reqRes] = await Promise.all([
        api.get('/products'),
        api.get('/wholesale/my-requests')
      ]);
      setProducts(prodRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      console.error('Failed to load wholesale data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSelect = (e) => {
    const pId = e.target.value;
    setSelectedProduct(pId);
    const prod = products.find(p => String(p.id) === String(pId));
    if (prod) {
      // Auto-suggest a 30% discount off standard unit price for bulk orders
      setPrice(parseFloat((prod.price * 0.7).toFixed(2)));
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || qty < 10 || price <= 0) {
      toast.error('Bulk orders require a minimum quantity of 10 items');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/wholesale/request', {
        productId: selectedProduct,
        quantity: qty,
        offeredPrice: price,
        message: note
      });
      toast.success('Wholesale quote submitted successfully!');
      setSelectedProduct('');
      setNote('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNegotiationSubmit = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;
    setReplying(true);
    try {
      await api.patch(`/wholesale/${activeRequest.id}/respond`, {
        counterPrice: counterPriceInput ? parseFloat(counterPriceInput) : undefined,
        message: replyMessage
      });
      toast.success('Response sent successfully!');
      setReplyMessage('');
      setCounterPriceInput('');
      const updatedList = await api.get('/wholesale/my-requests');
      setRequests(updatedList.data);
      const updatedActive = updatedList.data.find(r => r.id === activeRequest.id);
      setActiveRequest(updatedActive);
    } catch (err) {
      toast.error('Failed to send negotiation reply');
    } finally {
      setReplying(false);
    }
  };

  const handleAcceptQuote = async (reqId) => {
    try {
      await api.patch(`/wholesale/${reqId}/respond`, {
        status: 'Accepted'
      });
      toast.success('Quote accepted!');
      fetchData();
      if (activeRequest?.id === reqId) setActiveRequest(null);
    } catch (err) {
      toast.error('Failed to accept quote');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-955">
        <div className="w-10 h-10 border-4 border-violet-650 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-955 py-10 px-4 text-gray-900 dark:text-gray-150 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-br from-violet-600 via-indigo-750 to-indigo-950 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-3 max-w-lg z-10">
            <span className="bg-white/10 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              💼 B2B Business Trade
            </span>
            <h1 className="text-3xl font-black leading-tight tracking-tight">Wholesale & Bulk Sourcing Portal</h1>
            <p className="text-violet-250 text-sm">
              Verify trade status, submit bulk order requirements, and negotiate direct quotes with platform verified manufacturers.
            </p>
          </div>
          <Store size={100} className="text-white/10 absolute right-4 md:static z-0 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-gray-950 dark:text-white mb-4 text-sm uppercase tracking-wider">
                Create Bulk Quote Request
              </h3>
              
              <form onSubmit={handleQuoteSubmit} className="space-y-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <div>
                  <label className="block text-gray-400 dark:text-gray-500 font-bold uppercase mb-2">Target Product</label>
                  <select
                    value={selectedProduct}
                    onChange={handleProductSelect}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs focus:border-violet-500 outline-none transition dark:text-white cursor-pointer"
                  >
                    <option value="">Select Item</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (${p.price}/unit)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 dark:text-gray-500 font-bold uppercase mb-2">Quantity (MOQ: 10)</label>
                    <input
                      type="number"
                      min="10"
                      value={qty}
                      onChange={(e) => setQty(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-xs focus:border-violet-500 outline-none transition dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 dark:text-gray-500 font-bold uppercase mb-2">Offered Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-xs focus:border-violet-500 outline-none transition dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 dark:text-gray-500 font-bold uppercase mb-2">Covering Message / Terms</label>
                  <textarea
                    rows="3"
                    placeholder="Describe custom packing requirements, logistics terms, or schedules..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-xs focus:border-violet-500 outline-none transition dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-violet-650 hover:bg-violet-750 text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md shadow-violet-500/10 text-center uppercase tracking-wider text-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Bulk Proposal'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column List / Thread */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeRequest ? (
              /* Negotiation Thread View */
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl flex flex-col justify-between min-h-[480px]">
                <div>
                  <div className="flex justify-between items-start border-b border-gray-50 dark:border-gray-850 pb-4 mb-4">
                    <div>
                      <button onClick={() => setActiveRequest(null)} className="text-xs font-bold text-gray-400 hover:text-violet-650 mb-1 block">← Return to List</button>
                      <h4 className="font-black text-gray-900 dark:text-white text-sm">{activeRequest.productName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Bulk order for {activeRequest.quantity} units @ ${activeRequest.offeredPrice}/unit</p>
                    </div>
                    <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase bg-violet-50 dark:bg-violet-950/20 text-violet-650 dark:text-violet-400">
                      {activeRequest.status}
                    </span>
                  </div>

                  {/* Message bubble logs */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
                    {(activeRequest.messages || []).map((m, idx) => {
                      const isMe = m.senderId === activeRequest.buyerId;
                      return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3 rounded-2xl border ${
                            isMe 
                              ? 'bg-violet-50 border-violet-100 dark:bg-violet-950/15 dark:border-violet-950/30 text-gray-800 dark:text-gray-200' 
                              : 'bg-gray-50 border-gray-100 dark:bg-gray-800/40 dark:border-gray-850 text-gray-700 dark:text-gray-300'
                          }`}>
                            <p className="leading-relaxed font-semibold">{m.text}</p>
                            <span className="text-[9px] text-gray-400 mt-1 block text-right">{new Date(m.date).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleNegotiationSubmit} className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-850/40 space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Counter Offer Price ($) - Optional"
                      value={counterPriceInput}
                      onChange={(e) => setCounterPriceInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs outline-none focus:border-violet-500 transition dark:text-white"
                    />
                    {activeRequest.status === 'Countered' && (
                      <button
                        type="button"
                        onClick={() => handleAcceptQuote(activeRequest.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1"
                      >
                        <Check size={14} /> Accept Quote
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your response terms here..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs outline-none focus:border-violet-500 transition"
                    />
                    <button
                      type="submit"
                      disabled={replying}
                      className="bg-violet-650 hover:bg-violet-750 text-white p-2.5 rounded-xl transition flex-shrink-0"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </form>

              </div>
            ) : (
              /* Request list Grid */
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm min-h-[480px]">
                <h3 className="font-bold text-gray-950 dark:text-white mb-5 border-b border-gray-50 dark:border-gray-850 pb-3">
                  Ongoing Sourcing Negotiations
                </h3>
                
                {requests.length === 0 ? (
                  <p className="text-center py-20 text-sm text-gray-400 font-medium">No sourcing quote logs. Start negotiations above!</p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => { setActiveRequest(r); setCounterPriceInput((r.offeredPrice ?? 0).toString()); }}
                        className="p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-850 rounded-2xl flex items-center justify-between transition hover:border-violet-250 cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{r.productName}</h4>
                          <p className="text-xs text-gray-450 dark:text-gray-400 mt-1 font-semibold">
                            {r.quantity} units · Proposed: <span className="font-black text-gray-700 dark:text-gray-300">${r.offeredPrice}/unit</span>
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium mt-1 inline-block">Updated: {new Date(r.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase ${
                            r.status === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20'
                              : r.status === 'Countered'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                              : 'bg-violet-50 text-violet-650 dark:bg-violet-950/20'
                          }`}>
                            {r.status}
                          </span>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
