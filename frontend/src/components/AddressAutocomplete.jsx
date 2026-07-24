import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, Search, Loader } from 'lucide-react';

export default function AddressAutocomplete({ onSelectAddress }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    setIsOpen(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: val,
          format: 'json',
          addressdetails: 1,
          limit: 5
        },
        headers: {
          'Accept-Language': 'en'
        }
      });
      setSuggestions(res.data);
    } catch (err) {
      console.error('OSM Nominatim lookup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    const addr = item.address || {};
    
    // Structure standard address fields
    const addressResult = {
      addressLine1: item.display_name.split(',').slice(0, 2).join(',').trim(),
      city: addr.city || addr.town || addr.village || addr.suburb || '',
      state: addr.state || '',
      zipCode: addr.postcode || '',
      country: addr.country || ''
    };

    onSelectAddress(addressResult);
    setQuery(addressResult.addressLine1);
    setIsOpen(false);
  };

  return (
    <div className="relative text-xs">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Start typing your address..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 outline-none focus:border-violet-500 transition dark:text-white"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Loader size={16} className="animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.place_id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition flex items-start gap-2.5 border-b border-gray-50 dark:border-gray-850/20 last:border-b-0 cursor-pointer text-gray-700 dark:text-gray-300"
            >
              <MapPin size={14} className="text-violet-500 mt-0.5 flex-shrink-0" />
              <span className="truncate leading-normal">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
