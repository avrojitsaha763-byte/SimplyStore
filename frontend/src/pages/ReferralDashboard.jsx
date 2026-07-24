import React, { useEffect, useState } from 'react';
import { Gift, Share2, Copy, Users, CheckCircle, Clock, Heart, Award } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function ReferralDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const [stats, setStats] = useState({ referrals: [], totalCredits: 0, successfulCount: 0 });
  const [refLink, setRefLink] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [codeRes, statsRes] = await Promise.all([
          api.get('/referrals/my-code'),
          api.get('/referrals/stats')
        ]);
        setRefLink(codeRes.data.referralLink);
        setCode(codeRes.data.code);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to load referral details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink)
      .then(() => toast.success('Referral link copied!'))
      .catch(() => toast.error('Copy failed — please copy the link manually'));
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Hey! Sign up using my referral link on SimplyStore and get $25 off your first order! 🎁 ${refLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-955 text-gray-900 dark:text-gray-150 py-10 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-950 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-32 h-32 bg-white/5 rounded-full blur-lg pointer-events-none" />
          
          <div className="space-y-4 max-w-lg z-10">
            <span className="bg-white/10 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              👥 Invite Friends & Earn
            </span>
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Get $50 Free Store Credit
            </h1>
            <p className="text-violet-200 text-sm">
              Share SimplyStore with your friends. They get $25 off their first purchase, and you earn $50 credit once they buy!
            </p>
          </div>
          <Gift size={120} className="text-white/10 absolute right-4 md:static z-0 flex-shrink-0" />
        </div>

        {/* Share Link Builder */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
            Your Invitation Code
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 px-4 py-3 rounded-xl font-bold font-mono text-sm dark:text-white flex items-center justify-between">
              <span className="truncate">{refLink}</span>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded ml-2 uppercase font-sans">
                Code: {code}
              </span>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={handleCopy}
                className="bg-violet-650 hover:bg-violet-750 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs flex-1 sm:flex-none justify-center"
              >
                <Copy size={16} /> Copy
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs flex-1 sm:flex-none justify-center"
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl text-center">
            <Users className="mx-auto text-violet-500 mb-3" size={28} />
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Shares</h3>
            <p className="text-2xl font-black text-gray-950 dark:text-white">{stats.referrals.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl text-center">
            <CheckCircle className="mx-auto text-emerald-500 mb-3" size={28} />
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Successful Converts</h3>
            <p className="text-2xl font-black text-gray-950 dark:text-white">{stats.successfulCount}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl text-center">
            <Award className="mx-auto text-amber-500 mb-3" size={28} />
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Credit Earned</h3>
            <p className="text-2xl font-black text-gray-950 dark:text-white">${stats.totalCredits}</p>
          </div>

        </div>

        {/* Referrals Table Log */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-bold text-gray-950 dark:text-white mb-5 border-b border-gray-50 dark:border-gray-850 pb-3">
            Invitation Status Log
          </h3>
          {stats.referrals.length === 0 ? (
            <p className="text-center py-10 text-sm text-gray-400 font-medium">No referral stats yet. Start sharing to unlock rewards!</p>
          ) : (
            <div className="space-y-4">
              {stats.referrals.map((r, idx) => (
                <div key={r.id || r.referredEmail || idx} className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-850/50 pb-3 last:border-b-0">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{r.referredEmail}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Invited on {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                      r.status === "completed" 
                        ? "bg-emerald-50 text-emerald-605 dark:bg-emerald-950/20" 
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                    }`}>
                      {r.status === "completed" ? "Success" : "Joined"}
                    </span>
                    {r.creditEarned > 0 && <p className="text-xs text-emerald-600 font-bold mt-1">+${r.creditEarned}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
