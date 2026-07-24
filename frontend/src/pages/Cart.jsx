import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus, Tag, X } from 'lucide-react';
import { updateQuantity, removeFromCart, applyCoupon, removeCoupon } from '../redux/slices/cartSlice';
import { coupons } from '../mock/data';
import toast from 'react-hot-toast';
import RecommendationStrip from '../components/RecommendationStrip';
import { trackFunnelEvent } from '../api/api';

const shippingThreshold = 150;

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.items);
  const { couponCode, discountPercent, discountAmount } = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);

  const [couponInput, setCouponInput] = useState('');

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let activeDiscount = 0;
  if (couponCode) {
    if (discountPercent > 0) {
      activeDiscount = (subtotal * discountPercent) / 100;
    } else if (discountAmount > 0) {
      activeDiscount = Math.min(discountAmount, subtotal);
    }
  }

  const shipping = subtotal > shippingThreshold || subtotal === 0 ? 0 : 15;
  const tax = (subtotal - activeDiscount) * 0.1;
  const total = subtotal - activeDiscount + shipping + tax;

  const progress = Math.min((subtotal / shippingThreshold) * 100, 100);

  const handleQtyChange = (item, delta) => {
    dispatch(updateQuantity({
      id: item.id,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      delta,
    }));
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({
      id: item.id,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
    }));
    toast.success('Item removed from cart');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;

    const matched = coupons.find(
      (c) => c.code.toLowerCase() === couponInput.trim().toLowerCase()
    );

    if (!matched) { toast.error('Invalid coupon code'); return; }
    if (!matched.active) { toast.error('This coupon has expired'); return; }
    if (subtotal < matched.minOrder) {
      toast.error(`Minimum order of $${matched.minOrder} required for this coupon`);
      return;
    }

    dispatch(applyCoupon({ code: matched.code, discount: matched.discount, type: matched.type }));
    toast.success(`Coupon "${matched.code}" applied!`);
    setCouponInput('');
  };

  const handleRemoveCouponClick = () => {
    dispatch(removeCoupon());
    toast.success('Coupon removed');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition"
          >
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <h1 className="text-3xl font-black mb-8 tracking-tight dark:text-white">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-6" />
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/"
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-md shadow-violet-500/20 dark:shadow-none"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">

              {/* Shipping Progress Bar */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {progress < 100
                      ? `Add $${(shippingThreshold - subtotal).toFixed(2)} more for FREE shipping!`
                      : '🎉 Free shipping unlocked!'}
                  </span>
                  <span className="text-xs font-bold text-violet-600">{Math.round(progress)}%</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Items with AnimatePresence */}
              <AnimatePresence>
                {cartItems.map((item, idx) => (
                  <motion.div
                    key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ x: -20, opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 gap-4 overflow-hidden"
                  >
                    {/* Left: Image & Details */}
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-snug line-clamp-1">
                          {item.name}
                        </h3>
                        {item.brand && (
                          <p className="text-xs text-gray-400 font-medium mb-1">by {item.brand}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {item.selectedColor && (
                            <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                              Size: {item.selectedSize}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Qty, Price, Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                      {/* Qty stepper */}
                      <div className="flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-1 py-1 gap-1">
                        <button
                          onClick={() => handleQtyChange(item, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-2 text-sm font-bold w-7 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQtyChange(item, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-base font-bold text-gray-900 dark:text-white block">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">${item.price} each</span>
                      </div>

                      <button
                        onClick={() => handleRemove(item)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-2.5 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <aside className="space-y-5 sticky top-24 self-start">

              {/* Coupon */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">
                  Promo / Coupon Code
                </h3>
                {couponCode ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Tag size={16} />
                      <span className="text-sm font-bold uppercase">{couponCode} applied</span>
                    </div>
                    <button
                      onClick={handleRemoveCouponClick}
                      className="text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 p-1.5 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME25"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm focus:border-violet-500 outline-none transition uppercase font-bold text-gray-700 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="bg-gray-900 dark:bg-gray-800 hover:bg-violet-600 dark:hover:bg-violet-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Summary */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>

                <div className="space-y-4 text-sm font-semibold text-gray-600 dark:text-gray-400 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>

                  {activeDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount ({couponCode})</span>
                      <span>-${activeDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-gray-900 dark:text-white">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span className="text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-black text-xl text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-5 mb-6">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => {
                    trackFunnelEvent('begin_checkout', null, { cartValue: total });
                    navigate('/checkout');
                  }}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl transition duration-300 shadow-lg shadow-violet-500/20 dark:shadow-none text-center"
                >
                  Proceed to Checkout
                </button>

                {/* Trust strip */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className="text-xs text-gray-400 flex items-center gap-1">🔒 Secure</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">↩️ Free Returns</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">✅ Verified Sellers</span>
                </div>
              </div>
            </aside>
          </div>
        )}
        <RecommendationStrip userId={user?.id} />
      </div>
    </div>
  );
}
