import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft, CreditCard, Lock, ShieldCheck, CheckCircle2,
  MapPin, ChevronRight, Package, Truck, Star
} from 'lucide-react';
import { checkoutOrder } from '../redux/slices/ordersSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { fetchProducts } from '../redux/slices/productsSlice';
import { trackFunnelEvent } from '../api/api';
import toast from 'react-hot-toast';
import AddressAutocomplete from '../components/AddressAutocomplete';
import api from '../api/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ── Confetti utility ──────────────────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 8 + 4,
    d: Math.random() * 120 + 20,
    color: ['#7C3AED', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#3B82F6'][Math.floor(Math.random() * 6)],
    tilt: Math.random() * 10 - 10,
    tiltAngle: 0,
    tiltAngleInc: (Math.random() * 0.07) + 0.05,
  }));
  let angle = 0;
  let frame;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle += 0.01;
    pieces.forEach(p => {
      p.tiltAngle += p.tiltAngleInc;
      p.y += (Math.cos(angle + p.d) + 2) * 1.5;
      p.tilt = Math.sin(p.tiltAngle) * 15;
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
    });
    if (pieces.some(p => p.y < canvas.height + 20)) {
      frame = requestAnimationFrame(draw);
    } else {
      document.body.removeChild(canvas);
    }
  };
  frame = requestAnimationFrame(draw);
  setTimeout(() => { cancelAnimationFrame(frame); if (document.body.contains(canvas)) document.body.removeChild(canvas); }, 4000);
}

// ── Step indicator ─────────────────────────────────────────────────────────────
const STEPS = ['Shipping', 'Payment', 'Review & Pay'];

function StepBar({ current }) {
  return (
    <div className="flex items-center mb-10">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                done ? 'bg-violet-600 text-white' : active ? 'bg-violet-600 text-white ring-4 ring-violet-200 dark:ring-violet-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                {done ? <CheckCircle2 size={18} /> : i + 1}
              </div>
              <span className={`text-xs mt-2 font-semibold ${active ? 'text-violet-600 dark:text-violet-400' : done ? 'text-gray-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mb-5 transition-all duration-500 ${done ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Input helper ──────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition dark:text-white";

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);

  const cartItems = useSelector((state) => state.cart.items);
  const { couponCode, discountPercent, discountAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user ? user.name : '',
      email: user ? user.email : '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
    },
  });

  useEffect(() => {
    if (cartItems.length === 0 && !placing) {
      navigate('/cart');
    }
  }, [cartItems, navigate, placing]);

  const handleSelectAddress = (addr) => {
    setValue('address', addr.addressLine1);
    setValue('city', addr.city);
    setValue('state', addr.state);
    setValue('zipCode', addr.zipCode);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let activeDiscount = 0;
  if (couponCode) {
    if (discountPercent > 0) activeDiscount = (subtotal * discountPercent) / 100;
    else if (discountAmount > 0) activeDiscount = Math.min(discountAmount, subtotal);
  }
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const tax = (subtotal - activeDiscount) * 0.1;
  const total = subtotal - activeDiscount + shipping + tax;

  // Step 0 fields
  const shippingFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
  // Step 1 fields
  const paymentFields = ['cardName', 'cardNumber', 'cardExpiry', 'cardCvv'];

  const handleNext = async () => {
    const fields = step === 0 ? shippingFields : paymentFields;
    const valid = await trigger(fields);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data) => {
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return; }
    setPlacing(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setPlacing(false);
      return;
    }

    try {
      // 1. Create order on backend
      const amountInPaise = Math.round(total * 100);
      const { data: orderData } = await api.post('/payments/create-order', { amount: amountInPaise });
      
      if (!orderData.success) throw new Error('Could not create order');

      // 2. Initialize Razorpay Checkout
      const options = {
        key: 'rzp_test_mock123', // Replace with real key in production
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'SimplyStore',
        description: 'Secure Checkout',
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              // 4. Record order in database
              const checkoutData = {
                items: cartItems.map(item => ({
                  id: item.id, name: item.name, price: item.price, quantity: item.quantity,
                  selectedColor: item.selectedColor, selectedSize: item.selectedSize,
                })),
                shippingDetails: {
                  fullName: data.fullName, email: data.email, address: data.address,
                  city: data.city, state: data.state, zipCode: data.zipCode, phone: data.phone,
                },
                paymentMethod: 'Razorpay',
                userId: user?.id || null,
                couponCode: couponCode || null,
              };
              
              const res = await dispatch(checkoutOrder(checkoutData)).unwrap();
              if (res && res.success) {
                launchConfetti();
                toast.success('🎉 Order placed successfully!');
                dispatch(clearCart());
                trackFunnelEvent('purchase', null, { orderId: res.orderId, total });
                dispatch(fetchProducts());
                setTimeout(() => navigate(user ? '/orders' : '/'), 1500);
              } else {
                toast.error(res.message || 'Checkout failed');
                setPlacing(false);
              }
            }
          } catch (err) {
            toast.error('Payment verification failed');
            setPlacing(false);
          }
        },
        prefill: {
          name: data.fullName,
          email: data.email,
          contact: data.phone
        },
        theme: { color: '#7C3AED' },
        modal: {
          ondismiss: function() {
            setPlacing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + response.error.description);
        setPlacing(false);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error('Could not initiate payment');
      setPlacing(false);
    }
  };

  const values = watch();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition mb-8">
          <ArrowLeft size={16} /> Return to Cart
        </Link>

        <h1 className="text-3xl font-black mb-8 tracking-tight dark:text-white">Secure Checkout</h1>

        <StepBar current={step} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Left: Step Forms ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* STEP 0: Shipping */}
              {step === 0 && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-xl">
                      <MapPin size={20} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shipping Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Full Name" error={errors.fullName}>
                      <input {...register('fullName', { required: 'Full name is required' })} className={inputCls} />
                    </Field>
                    <Field label="Email Address" error={errors.email}>
                      <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} className={inputCls} />
                    </Field>
                    <Field label="Phone Number" error={errors.phone}>
                      <input type="tel" {...register('phone', { required: 'Phone is required' })} className={inputCls} />
                    </Field>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Search Address (Autocomplete)</label>
                      <AddressAutocomplete onSelectAddress={handleSelectAddress} />
                    </div>
                    <div className="md:col-span-2">
                      <Field label="Address" error={errors.address}>
                        <input {...register('address', { required: 'Address is required' })} className={inputCls} placeholder="Street, Apartment, etc." />
                      </Field>
                    </div>
                    <Field label="City" error={errors.city}>
                      <input {...register('city', { required: 'City is required' })} className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="State" error={errors.state}>
                        <input {...register('state', { required: 'Required' })} className={inputCls} />
                      </Field>
                      <Field label="ZIP Code" error={errors.zipCode}>
                        <input {...register('zipCode', { required: 'Required' })} className={inputCls} />
                      </Field>
                    </div>
                  </div>
                  <button type="button" onClick={handleNext}
                    className="mt-6 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                    Continue to Payment <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 1: Payment */}
              {step === 1 && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-xl">
                        <CreditCard size={20} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Details</h2>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                      <Lock size={12} /> SSL Secured
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Field label="Cardholder Name" error={errors.cardName}>
                      <input {...register('cardName', { required: 'Name is required' })} className={inputCls} />
                    </Field>
                    <Field label="Card Number" error={errors.cardNumber}>
                      <div className="relative">
                        <input placeholder="4111 2222 3333 4444" maxLength={16}
                          {...register('cardNumber', { required: 'Card number is required', pattern: { value: /^\d{16}$/, message: 'Must be 16 digits' } })}
                          className={inputCls + ' pl-11'} />
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiry (MM/YY)" error={errors.cardExpiry}>
                        <input placeholder="MM/YY" maxLength={5}
                          {...register('cardExpiry', { required: 'Required', pattern: { value: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/, message: 'Use MM/YY' } })}
                          className={inputCls} />
                      </Field>
                      <Field label="CVV" error={errors.cardCvv}>
                        <input type="password" placeholder="•••" maxLength={4}
                          {...register('cardCvv', { required: 'Required', pattern: { value: /^\d{3,4}$/, message: 'Invalid CVV' } })}
                          className={inputCls} />
                      </Field>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setStep(0)}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-xl transition">
                      Back
                    </button>
                    <button type="button" onClick={handleNext}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                      Review Order <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Review */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in-up">
                  {/* Shipping summary */}
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-violet-600" />
                        <span className="font-bold text-sm dark:text-white">Shipping to</span>
                      </div>
                      <button type="button" onClick={() => setStep(0)} className="text-xs text-violet-600 font-semibold hover:underline">Edit</button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{values.fullName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{values.address}, {values.city}, {values.state} {values.zipCode}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{values.phone}</p>
                  </div>
                  {/* Payment summary */}
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-violet-600" />
                        <span className="font-bold text-sm dark:text-white">Payment</span>
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-violet-600 font-semibold hover:underline">Edit</button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Credit Card ending in ···· {values.cardNumber?.slice(-4) || '****'}
                    </p>
                  </div>
                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-400 font-medium py-2">
                    <span className="flex items-center gap-1"><Lock size={12} /> SSL Secured</span>
                    <span className="flex items-center gap-1"><Package size={12} /> Free Returns</span>
                    <span className="flex items-center gap-1"><Star size={12} /> Verified Sellers</span>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-xl transition">
                      Back
                    </button>
                    <button type="submit" disabled={placing}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25">
                      <ShieldCheck size={18} />
                      {placing ? 'Placing Order…' : `Pay $${total.toFixed(2)}`}
                    </button>
                  </div>
                  <p className="text-[11px] text-center text-gray-400 mt-1 leading-relaxed">
                    By placing this order you agree to SimplyStore's Terms of Service and Privacy Policy.
                  </p>
                </div>
              )}
            </div>

            {/* ── Right: Order Summary (sticky) ── */}
            <div className="sticky top-24 h-fit">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <Package size={18} className="text-violet-600" /> Order Summary
                </h3>
                <div className="max-h-52 overflow-y-auto mb-5 space-y-3 pr-1">
                  {cartItems.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex gap-3 items-center">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-gray-50 dark:bg-gray-800" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-900 dark:text-white font-semibold">${subtotal.toFixed(2)}</span></div>
                  {activeDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Discount ({couponCode})</span><span>-${activeDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between"><span>Shipping</span><span className="text-gray-900 dark:text-white font-semibold">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                  <div className="flex justify-between"><span>Tax (10%)</span><span className="text-gray-900 dark:text-white font-semibold">${tax.toFixed(2)}</span></div>
                </div>
                <div className="flex justify-between font-black text-xl text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-4">
                  <span>Total</span>
                  <span className="text-violet-600">${total.toFixed(2)}</span>
                </div>
                {activeDiscount > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 text-right">
                    You save ${activeDiscount.toFixed(2)} 🎉
                  </p>
                )}
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
