import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { fetchWishlist, toggleWishlistItem } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: wishlistItems, loading } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchWishlist());
  }, [dispatch, user, navigate]);

  const handleRemove = (product) => {
    dispatch(toggleWishlistItem({ product, isWishlisted: true }))
      .unwrap()
      .then(() => toast.success('Removed from wishlist'))
      .catch(() => toast.error('Error removing item'));
  };

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    dispatch(addToCart({
      ...product,
      quantity: 1,
      selectedColor: product.colors?.[0] || '',
      selectedSize: product.sizes?.[0] || '',
    }));
    toast.success('Added to cart!');
  };

  const handleAddAllToCart = () => {
    const inStock = wishlistItems.filter((item) => item.stock !== 0);
    if (inStock.length === 0) {
      toast.error('All items are out of stock');
      return;
    }
    inStock.forEach((item) => {
      dispatch(addToCart({
        ...item,
        quantity: 1,
        selectedColor: item.colors?.[0] || '',
        selectedSize: item.sizes?.[0] || '',
      }));
    });
    toast.success(`${inStock.length} item${inStock.length > 1 ? 's' : ''} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black tracking-tight dark:text-white flex items-center">
            My Wishlist
            {wishlistItems.length > 0 && (
              <span className="ml-3 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 rounded-full text-sm px-3 py-1 font-bold">
                {wishlistItems.length}
              </span>
            )}
          </h1>
          {wishlistItems.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 shadow-md shadow-violet-500/20"
            >
              Add All to Cart
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Loading your wishlist...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <Heart size={64} className="mx-auto text-violet-300 mb-6" />
            <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Tap the heart icon on any product to save it to your wishlist.
            </p>
            <Link
              to="/"
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-md shadow-violet-500/20 dark:shadow-none"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {wishlistItems.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-950">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Heart remove button */}
                    <button
                      onClick={() => handleRemove(product)}
                      className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl text-rose-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shadow-sm"
                      title="Remove from wishlist"
                    >
                      <Heart size={16} className="fill-rose-500" />
                    </button>
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <span className="text-xs text-violet-600 dark:text-violet-400 font-semibold uppercase tracking-wider block mb-1">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </p>
                    <button
                      disabled={product.stock === 0}
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white rounded-xl py-2 text-sm font-semibold transition-colors duration-200"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
