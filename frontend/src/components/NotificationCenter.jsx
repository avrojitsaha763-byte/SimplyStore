import React, { useEffect, useState } from 'react';
import { Bell, ShoppingBag, Tag, AlertTriangle, ShieldCheck, Mail, CheckCircle } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('simplystore_user');
    if (!storedUser) return;
    fetchAlerts();

    // Setup push notifications
    const initPush = async () => {
      try {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            const VAPID_PUBLIC_KEY = 'BCu38hHdKprAut5UGhgmiJxJ8nHAKjns8N-62mkCU86ozOFfHQZZb917cGxubJ-CGFSK5RCqODe1aL8RWwlrD1o';
            const urlBase64ToUint8Array = (base64String) => {
              const padding = '='.repeat((4 - base64String.length % 4) % 4);
              const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
              const rawData = window.atob(base64);
              const outputArray = new Uint8Array(rawData.length);
              for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
              }
              return outputArray;
            };
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            await api.post('/notifications/subscribe', subscription);
          }
        }
      } catch (err) {
        console.error('Push registration failed:', err);
      }
    };
    initPush();

    const interval = setInterval(() => {
      // Stop polling if user has since logged out
      if (!localStorage.getItem('simplystore_user')) {
        clearInterval(interval);
        return;
      }
      fetchAlerts();
    }, 30000);
    return () => clearInterval(interval); // Always cleanup on unmount
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) fetchAlerts();
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked read');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order_update':
        return <ShoppingBag size={14} className="text-violet-500" />;
      case 'price_drop':
        return <Tag size={14} className="text-emerald-500" />;
      case 'back_in_stock':
        return <CheckCircle size={14} className="text-blue-500" />;
      case 'flash_sale':
        return <Tag size={14} className="text-amber-500" />;
      default:
        return <Bell size={14} className="text-gray-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const dropdownRef = React.useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition duration-300 text-gray-500 dark:text-gray-400 cursor-pointer"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in-up">
          <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-gray-100 dark:border-gray-800/80">
            <h4 className="font-bold text-xs text-gray-950 dark:text-white uppercase tracking-wider">Alerts & Messages</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-black uppercase text-violet-650 dark:text-violet-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {loading && notifications.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400 font-medium">No messages in inbox.</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`p-3 rounded-xl border transition text-xs cursor-pointer flex gap-3 ${
                    n.read
                      ? 'bg-transparent border-transparent text-gray-400'
                      : 'bg-violet-50/40 dark:bg-violet-950/10 border-violet-100 dark:border-violet-950/30 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-805 rounded-lg flex-shrink-0 h-fit">
                    {getIcon(n.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold leading-tight">{n.title}</h5>
                    <p className="text-[11px] text-gray-450 dark:text-gray-400 leading-snug mt-0.5">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
