import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';
import { addToCart } from '../redux/slices/cartSlice';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function RecommendationStrip({ productId, userId, title = "Recommended For You" }) {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let endpoint = '/recommendations/trending';
        if (productId) {
          endpoint = `/recommendations/product/${productId}`;
        } else if (userId) {
          endpoint = `/recommendations/user/${userId}`;
        }
        const res = await api.get(endpoint);
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [productId, userId]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      ...product,
      quantity: 1,
      selectedColor: product.colors?.[0] || '',
      selectedSize: product.sizes?.[0] || ''
    }));
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-48 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-850 p-3">
              <div className="w-full aspect-square bg-gray-150 dark:bg-gray-800 rounded-xl animate-pulse mb-3"></div>
              <div className="h-4 w-3/4 bg-gray-150 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-150 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="py-8 border-t border-gray-100 dark:border-gray-800 mt-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-violet-600" size={18} />
          <span>{title}</span>
        </h3>
        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest flex items-center gap-1">
          Explore Deals <ArrowRight size={12} />
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {products.map((prod) => (
          <div
            key={prod.id || prod._id}
            className="w-52 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-3 hover:shadow-lg hover:shadow-violet-500/5 transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-full aspect-square overflow-hidden bg-gray-50 dark:bg-gray-950 rounded-xl relative group">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-3 line-clamp-1 truncate leading-tight">
                {prod.name}
              </h4>
              <p className="text-xs text-gray-400 dark:text-gray-550 mt-1">{prod.category}</p>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-extrabold text-gray-950 dark:text-white">
                ${prod.price.toFixed(2)}
              </span>
              <button
                onClick={() => handleAddToCart(prod)}
                className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white rounded-xl transition duration-300"
              >
                <ShoppingCart size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
