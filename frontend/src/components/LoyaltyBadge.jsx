import React, { useEffect, useState } from 'react';
import { Award, Zap, HelpCircle } from 'lucide-react';
import api from '../api/api';

export default function LoyaltyBadge() {
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyalty = async () => {
      const storedUser = localStorage.getItem('simplystore_user');
      if (!storedUser) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/loyalty/me');
        setLoyalty(res.data);
      } catch (err) {
        console.error('Failed to load loyalty:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoyalty();
  }, []);

  if (loading || !loyalty) return null;

  // Determine points threshold for next tier
  const getNextTierDetails = (tier, currentPoints) => {
    switch (tier) {
      case 'Bronze':
        return { next: 'Silver', threshold: 500, current: currentPoints };
      case 'Silver':
        return { next: 'Gold', threshold: 1500, current: currentPoints };
      case 'Gold':
        return { next: 'Platinum', threshold: 5000, current: currentPoints };
      default:
        return null;
    }
  };

  const nextDetails = getNextTierDetails(loyalty.tier, loyalty.points);
  const pct = nextDetails ? Math.min((nextDetails.current / nextDetails.threshold) * 100, 100) : 100;

  const getTierColor = (t) => {
    switch (t) {
      case 'Platinum':
        return 'text-slate-200 border-slate-700 bg-slate-800/40';
      case 'Gold':
        return 'text-amber-500 border-amber-600/30 bg-amber-500/10';
      case 'Silver':
        return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
      default:
        return 'text-orange-600 border-orange-500/30 bg-orange-500/10';
    }
  };

  return (
    <div className="p-3 text-xs border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40">
      
      {/* Tier Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Loyalty Standing</span>
        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase flex items-center gap-1 ${getTierColor(loyalty.tier)}`}>
          <Award size={10} /> {loyalty.tier}
        </span>
      </div>

      <div className="flex justify-between items-baseline mb-1">
        <span className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1">
          <Zap size={14} className="text-amber-500 fill-amber-500" />
          {loyalty.points} <span className="text-xs font-semibold text-gray-400">Points</span>
        </span>
        {nextDetails && (
          <span className="text-[10px] text-gray-450 font-bold">
            {nextDetails.current}/{nextDetails.threshold} to {nextDetails.next}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {nextDetails && (
        <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}

    </div>
  );
}
