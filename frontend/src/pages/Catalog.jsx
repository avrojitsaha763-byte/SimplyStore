import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Heart, ShoppingCart, Eye, Star, X,
  ShoppingBag, SlidersHorizontal, TrendingUp, Zap, ChevronDown
} from 'lucide-react';
import { fetchProducts } from '../redux/slices/productsSlice';
import { toggleWishlistItem } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { trackFunnelEvent } from '../api/api';
import { banners, categories } from '../mock/data';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import RecommendationStrip from '../components/RecommendationStrip';
import ReviewSection from '../components/ReviewSection';

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-20 rounded-full" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-3 w-3/4 rounded-lg" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-6 w-16 rounded-lg" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const dispatch = useDispatch();

  const { items: products, loading } = useSelector((state) => state.products);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Quick View state
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Banner autoplay
  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, []);

  const isWishlisted = (id) => wishlistItems.some((w) => w.id === id);

  const handleWishlistToggle = (product, e) => {
    e.stopPropagation();
    if (!user) { toast.error('Please sign in to save items to wishlist'); return; }
    const wishlisted = isWishlisted(product.id);
    dispatch(toggleWishlistItem({ product, isWishlisted: wishlisted }))
      .unwrap()
      .then((res) => {
        toast.success(res.action === 'added' ? `Saved to wishlist ♡` : 'Removed from wishlist');
      })
      .catch(() => toast.error('Error updating wishlist'));
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (product.stock === 0) { toast.error('Out of stock'); return; }
    dispatch(addToCart({
      ...product,
      selectedColor: product.colors?.[0] || '',
      selectedSize: product.sizes?.[0] || '',
      quantity: 1,
    }));
    trackFunnelEvent('add_to_cart', product.id, { price: product.price });
    toast.success(`Added to cart!`);
  };

  const openQuickView = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setSelectedColor(product.colors?.[0] || '');
    setSelectedSize(product.sizes?.[0] || '');
    trackFunnelEvent('view_item', product.id, { name: product.name });
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    if (selectedProduct.stock === 0) { toast.error('Out of stock'); return; }
    dispatch(addToCart({ ...selectedProduct, selectedColor, selectedSize, quantity: 1 }));
    trackFunnelEvent('add_to_cart', selectedProduct.id, { price: selectedProduct.price });
    toast.success(`${selectedProduct.name} added to cart!`);
    setSelectedProduct(null);
  };

  // Filter + sort
  let filtered = [...products];
  if (selectedCategory !== 'All') {
    filtered = filtered.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
  }
  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filtered.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
  else if (sortBy === 'newest') filtered.reverse();

  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <section className="relative h-[360px] sm:h-[480px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />
            <img
              src={banners[currentBanner].image}
              alt={banners[currentBanner].title}
              className="w-full h-full object-cover"
            />
            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-10">
              <motion.span
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-violet-600/90 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full w-max mb-4"
              >
                <Zap size={12} className="fill-white" /> {banners[currentBanner].badge}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-3xl sm:text-5xl font-black text-white mb-3 max-w-xl leading-tight tracking-tight"
              >
                {banners[currentBanner].title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="text-gray-300 mb-8 max-w-md text-base"
              >
                {banners[currentBanner].subtitle}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-xl transition duration-300 w-max shadow-lg shadow-violet-900/40"
                >
                  {banners[currentBanner].cta}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Integrated search bar floating on hero */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products, brands, categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl text-sm text-gray-900 dark:text-white shadow-2xl outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400 font-medium transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Banner dots */}
        <div className="absolute bottom-20 sm:bottom-8 right-6 z-20 flex gap-2">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrentBanner(i)}
              className={`h-2 rounded-full transition-all duration-300 ${currentBanner === i ? 'bg-white w-6' : 'bg-white/40 w-2'}`}
            />
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* ── Category Grid ────────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black tracking-tight dark:text-white">Browse by Category</h2>
            {selectedCategory !== 'All' && (
              <button onClick={() => setSelectedCategory('All')} className="text-sm text-violet-600 dark:text-violet-400 font-semibold hover:underline">
                Clear filter
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition flex-shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700'
              }`}
            >
              <ShoppingBag size={16} /> All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition flex-shrink-0 ${
                  selectedCategory === cat.name
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700'
                }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Filter & Sort Bar ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> products
              {selectedCategory !== 'All' && <span> in <span className="text-violet-600 font-semibold">{selectedCategory}</span></span>}
            </p>
            {activeFilterCount > 0 && (
              <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <SlidersHorizontal size={15} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-semibold outline-none bg-transparent dark:text-white cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Product Grid ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <ShoppingBag size={56} className="mx-auto text-violet-200 dark:text-violet-900 mb-5" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No products found</h3>
            <p className="text-sm text-gray-400 mb-6">Try different keywords or clear your filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 rounded-xl transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                onClick={(e) => openQuickView(product, e)}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/5 transition-all duration-300 group cursor-pointer flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-950">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
                    <button
                      disabled={product.stock === 0}
                      onClick={(e) => handleAddToCart(product, e)}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart size={14} />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openQuickView(product, e); }}
                      className="p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-xl text-gray-700 dark:text-gray-300 hover:text-violet-600"
                    >
                      <Eye size={15} />
                    </button>
                  </div>

                  {/* Top-right: wishlist */}
                  <button
                    onClick={(e) => handleWishlistToggle(product, e)}
                    className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-xl shadow-sm transition z-10 hover:scale-110"
                  >
                    <Heart
                      size={16}
                      className={isWishlisted(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-rose-500'}
                    />
                  </button>

                  {/* Badges */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                        -{product.discount}%
                      </span>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <span className="bg-gray-800 text-white text-xs font-bold px-4 py-1.5 rounded-full">Out of Stock</span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                        Only {product.stock} left
                      </span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                      {product.category}
                    </span>
                    {product.brand && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">by {product.brand}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {product.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                          ${(product.price || 0).toFixed(2)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs line-through text-gray-400">${product.originalPrice}</span>
                        )}
                      </div>
                      {product.rating && (
                        <div className="flex items-center gap-1 mt-0.5 text-amber-500">
                          <Star size={11} className="fill-amber-500" />
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            {product.rating.rate} <span className="text-gray-400">({product.rating.count})</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      disabled={product.stock === 0}
                      onClick={(e) => handleAddToCart(product, e)}
                      className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-violet-600 dark:hover:bg-violet-600 hover:text-white disabled:opacity-40 text-gray-700 dark:text-gray-300 rounded-xl transition duration-200"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <div className="max-w-7xl mx-auto px-4 mb-12">
        <RecommendationStrip userId={user?.id} />
      </div>

      {/* ── Quick View Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 z-10 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
            >
              {/* Close */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition z-20"
              >
                <X size={18} />
              </button>

              {/* Left: Image */}
              <div className="md:w-1/2 bg-gray-50 dark:bg-gray-950 p-8 flex items-center justify-center min-h-[280px]">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="max-h-[340px] w-full object-contain rounded-2xl"
                />
              </div>

              {/* Right: Details */}
              <div className="md:w-1/2 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                      {selectedProduct.category}
                    </span>
                    {selectedProduct.brand && (
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {selectedProduct.brand}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
                    {selectedProduct.name}
                  </h2>

                  {selectedProduct.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < Math.round(selectedProduct.rating.rate) ? 'fill-amber-500 text-amber-500' : 'text-gray-200 dark:text-gray-700'} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{selectedProduct.rating.rate}</span>
                      <span className="text-sm text-gray-400">({selectedProduct.rating.count} reviews)</span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-3 mb-5">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">${(selectedProduct.price || 0).toFixed(2)}</span>
                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                      <span className="text-lg line-through text-gray-400">${selectedProduct.originalPrice}</span>
                    )}
                    {selectedProduct.discount > 0 && (
                      <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-bold px-2 py-0.5 rounded-lg">
                        {selectedProduct.discount}% off
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{selectedProduct.description}</p>

                  {/* Color options */}
                  {selectedProduct.colors?.length > 0 && (
                    <div className="mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                        Color: <span className="text-gray-700 dark:text-gray-300">{selectedColor}</span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map((c) => (
                          <button key={c} onClick={() => setSelectedColor(c)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                              selectedColor === c
                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-300'
                            }`}
                          >{c}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size options */}
                  {selectedProduct.sizes?.length > 0 && (
                    <div className="mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                        Size: <span className="text-gray-700 dark:text-gray-300">{selectedSize}</span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((s) => (
                          <button key={s} onClick={() => setSelectedSize(s)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                              selectedSize === s
                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-300'
                            }`}
                          >{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-5 flex gap-3">
                  <button
                    disabled={selectedProduct.stock === 0}
                    onClick={handleModalAddToCart}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                  >
                    <ShoppingCart size={18} />
                    {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={(e) => handleWishlistToggle(selectedProduct, e)}
                    className="p-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                  >
                    <Heart size={20} className={isWishlisted(selectedProduct.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-500'} />
                  </button>
                </div>

                {/* Stock indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedProduct.stock > 5 ? 'bg-green-500' : selectedProduct.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-400 font-medium">
                    {selectedProduct.stock > 5 ? 'In stock' : selectedProduct.stock > 0 ? `Only ${selectedProduct.stock} left` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Product Q&A and Reviews Section */}
              <div className="w-full border-t border-gray-100 dark:border-gray-800 p-8 bg-gray-50/30 dark:bg-gray-900/10 md:col-span-2">
                <ReviewSection productId={selectedProduct.id} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
