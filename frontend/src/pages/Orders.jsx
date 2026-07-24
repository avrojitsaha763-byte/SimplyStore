import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { fetchMyOrders } from '../redux/slices/ordersSlice';
import GSTInvoice from '../components/GSTInvoice';

const STEPS = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const getStepIndex = (status) => {
  const map = {
    Pending: 0,
    Placed: 0,
    Confirmed: 1,
    Processing: 2,
    Shipped: 3,
    Delivered: 4,
    Cancelled: -1,
  };
  return map[status] ?? 0;
};

const getStatusChip = (status) => {
  const colors = {
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Placed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Shipped: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export default function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { myOrders: orders, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchMyOrders());
  }, [dispatch, user, navigate]);

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8 tracking-tight dark:text-white">My Orders</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <Package size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-6" />
            <h2 className="text-xl font-bold mb-2">No orders placed yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              When you purchase items, your order history and tracking details will appear here.
            </p>
            <Link
              to="/"
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-md shadow-violet-500/20 dark:shadow-none"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div>
            {orders.map((order) => {
              const currentStep = getStepIndex(order.status);
              const isExpanded = expandedOrder === order.id;
              const isCancelled = order.status === 'Cancelled';

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header – clickable toggle */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="flex flex-wrap items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 gap-3"
                  >
                    {/* Left: ID + date */}
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-0.5">
                        Order
                      </p>
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase">
                        #{String(order.id).slice(-8)}
                      </p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {new Date(order.createdAt || order.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Center: Status chip */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusChip(order.status)}`}
                    >
                      {order.status}
                    </span>

                    {/* Right: total + chevron */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">
                          ${(order.total || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Timeline – always visible */}
                  <div className="px-5 pb-4 border-t border-gray-50 dark:border-gray-800">
                    {isCancelled ? (
                      <div className="mt-4 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl py-3 px-4">
                        <span className="text-red-600 dark:text-red-400 text-sm font-bold">
                          ✕ Order Cancelled
                        </span>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-start">
                        {STEPS.map((step, i) => {
                          const completed = currentStep >= i;
                          const isLast = i === STEPS.length - 1;
                          return (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-colors duration-300 ${
                                    completed
                                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/40'
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                  }`}
                                >
                                  {i + 1}
                                </div>
                                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight w-12">
                                  {step}
                                </span>
                              </div>
                              {!isLast && (
                                <div className="flex-1 h-0.5 mt-3.5 mx-1 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      currentStep > i ? 'bg-violet-600 w-full' : 'w-0'
                                    }`}
                                  />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Expandable Items Accordion */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        key="items"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
                      >
                        <div className="p-5 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                            Items Purchased
                          </h4>
                          {order.items?.map((item, idx) => (
                            <div
                              key={`${item.id}-${idx}`}
                              className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50"
                            >
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded-lg bg-gray-100 dark:bg-gray-900 flex-shrink-0"
                                  />
                                )}
                                <div>
                                  <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="font-bold text-sm text-gray-900 dark:text-white flex-shrink-0">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}

                          {/* Shipping & Tracking */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 text-sm">
                              <h5 className="font-bold text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider mb-2">
                                Shipping Destination
                              </h5>
                              {order.shippingDetails ? (
                                <div className="space-y-0.5 font-semibold text-gray-700 dark:text-gray-300">
                                  <p className="font-black text-gray-900 dark:text-white">{order.shippingDetails.fullName}</p>
                                  <p>{order.shippingDetails.address}</p>
                                  <p>{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}</p>
                                  <p>Phone: {order.shippingDetails.phone}</p>
                                </div>
                              ) : (
                                <p className="text-gray-500">{order.address || 'Address detail unavailable'}</p>
                              )}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 text-sm flex flex-col justify-between">
                              <div>
                                <h5 className="font-bold text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider mb-2">
                                  Tracking Code
                                </h5>
                                <p className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400">
                                  {order.tracking || 'TRK-PENDING'}
                                </p>
                              </div>
                              <p className="text-xs text-gray-400 mt-3 leading-relaxed font-medium">
                                🚚 Dispatch handled by vendor logistics. Typically 3–5 business days.
                              </p>
                            </div>
                          </div>

                          {order.gst && (
                            <div className="pt-5 mt-4 border-t border-gray-100 dark:border-gray-800">
                              <h5 className="font-bold text-gray-450 dark:text-gray-500 text-xs uppercase tracking-wider mb-3">
                                Legally-Compliant Tax Invoice
                              </h5>
                              <GSTInvoice order={order} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
